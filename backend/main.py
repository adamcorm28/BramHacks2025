
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import cv2, base64
import asyncio
import serial
import time 
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from ultralytics import YOLO

load_dotenv()

client = AsyncOpenAI()

detection_enabled = False

yolo = YOLO("yolov8n.pt")

messages = [
    {"role": "system", "content": "You are a chatbot acting as a physics and astronomy professor. You will only answer questions related to anything about space, including history, facts, travel, and astrophysics, nothing else. Give a clear and concise answer. Your name is Wonder Rover. If someone doesn't know what to ask, give some sample questions they could ask. Keep the responses concise unless they want you to expand more. Your purpose is to make people more interested and engaged in space."}
]

class ChatRequest(BaseModel):
    message: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    arduino = serial.Serial(port="/dev/cu.usbserial-0001", baudrate=9600, timeout=1)
except:
    print("no arduino connected")
time.sleep(2)

moving: bool = False

cam_number = 0

camera = cv2.VideoCapture(cam_number) 

curr_time: int = 5

curr_move: str = ""

running: bool = False


async def countdown():
    global curr_time
    global curr_move
    global running

    while running:
        if not moving:
            await asyncio.sleep(1)
            curr_time -= 1
            if curr_time <= 0:
                if curr_move:
                    await move_rover()
                curr_time = 5
        
        else:
            await asyncio.sleep(0.5)


async def move_rover():
    global moving
    global curr_move

    if not moving:
        moving = True
        arduino.write(curr_move.encode())
        while moving:
            await asyncio.sleep(0.05)
            if arduino.in_waiting > 0:
                line = arduino.readline().decode().strip()
                if line == "DONE":
                    moving = False
                    curr_move = ""
            

@app.on_event("startup")
async def startup_event():
    global camera
    global running
    global cam_number
    running = True
    camera = cv2.VideoCapture(cam_number)
    await asyncio.sleep(1) 
    if not camera.isOpened():
        raise RuntimeError("Failed to open camera")
    asyncio.create_task(countdown())

@app.on_event("shutdown")
async def shutdown_event():
    global camera
    global running
    running = False
    if camera:
        print("Closing camera")
        camera.release()
        camera = None


@app.post("/toggle_detection")
async def toggle_detection(data: dict):
    global detection_enabled
    state = data.get("enabled", None)

    if state is None:
        detection_enabled = not detection_enabled 
    else:
        detection_enabled = bool(state)

    print(f"Detection {'ON' if detection_enabled else 'OFF'}")
    return {"detection_enabled": detection_enabled}



@app.websocket("/ws/timer")
async def timer_socket(websocket: WebSocket):
    global curr_time

    await websocket.accept()
    try:
        while running:
            now = time.time()
            remaining = max(curr_time - (now % 1), 0)  
            await websocket.send_json({"remaining": remaining})
            await asyncio.sleep(0.03)  # 20 updates/second (~50 ms precision)
    except Exception as e:
        print("Timer websocket closed:", e)


# @app.get("/timer")
# def get_timer():
#     global curr_time
#     return {"remaining": curr_time}


@app.post("/move")
async def set_move(data: dict):
    global moving
    global curr_move
    print(data.get("direction", "").upper())

    if moving:
        return {"status": "rover moving", "command": "Rover is in motion"}

    cmd = data.get("direction", "").upper()
    curr_move = cmd + '\n'
    
    return {"status": "movement received", "command": cmd}


@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message
    messages.append({"role": "user", "content": user_message})
    print(f">>> Received message: {user_message}")

    try:
        # Async non-streaming call (doesn't block event loop)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",  # or gpt-4o if needed
            messages=messages,
        )

        reply = response.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})

        print(">>> Reply:", reply)
        return {"reply": reply}

    except Exception as e:
        print("Chat error:", e)
        return {"reply": f"[SERVER ERROR: {e}]"}


@app.websocket('/ws/livestream')
async def livestream(websocket: WebSocket):
    await websocket.accept()
    global camera
    global running
    global cam_number

    frame_counter = 0

    try:
        while running:
            if not camera or not camera.isOpened():
                camera = cv2.VideoCapture(cam_number)
                await asyncio.sleep(1)

            success, frame = camera.read()
            if not success:
                await asyncio.sleep(0.1)
                continue

            # frame_counter += 1

            # if frame_counter % 5 == 0:
            #     detections = yolo(frame, verbose=False)
            #     boxes = detections[0].boxes.data.cpu().numpy()

            #     for box in boxes:
            #         cls_id = int(box[5]) 
            #         conf = float(box[4])  
            #         x1, y1, x2, y2 = box[:4]

            #         # Basic center and size check
            #         cx = (x1 + x2) / 2
            #         cy = (y1 + y2) / 2
            #         width = x2 - x1
            #         height = y2 - y1

            #         if 0.4 < cx / frame.shape[1] < 0.6 and conf > 0.5:
            #             print("Object detected ahead — stopping rover")
            #             if moving:
            #                 print("STOP")
            #                 # arduino.write(b"STOP\n")
            #                 # moving = False
            #                 # await asyncio.sleep(1)
            #                 # arduino.write(b"HARDLEFT\n")
            #                 # curr_move = "HARDLEFT\n"
            #             break

            if detection_enabled:
                results = yolo(frame, stream=False, verbose=False)
                annotated = results[0].plot()
                success, img = cv2.imencode(".jpg", annotated)
            else:
                success, img = cv2.imencode(".jpg", frame)

            if not success:
                await asyncio.sleep(0.1)
                continue

            frame_b64 = base64.b64encode(img).decode("utf-8")
            await websocket.send_text(frame_b64)

            await asyncio.sleep(0.05)
    
    except Exception as e:
        print("Websocket failed: ", e)
    
    finally:
        print("Connection Closed")

