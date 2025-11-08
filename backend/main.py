
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import cv2, base64
import asyncio
import serial
import time 


app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])

arduino = serial.Serial(port="/dev/cu.usbserial-0001", baudrate=9600, timeout=1)
time.sleep(2)

moving: bool = False

camera = cv2.VideoCapture(0) 

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
    running = True
    camera = cv2.VideoCapture(0)
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

    if moving:
        return {"status": "rover moving", "command": "Rover is in motion"}

    cmd = data.get("direction", "").upper()
    curr_move = cmd + '\n'
    
    return {"status": "movement received", "command": cmd}


@app.post("/incoming_chat")
async def gset_gpt_input(data: dict):
    global moving
    global curr_move

    if moving:
        return {"status": "rover moving", "command": "Rover is in motion"}

    cmd = data.get("direction", "").upper()
    curr_move = cmd + '\n'
    
    return {"status": "movement received", "command": cmd}



@app.websocket('/ws/livestream')
async def livestream(websocket: WebSocket):
    await websocket.accept()
    global camera
    global running

    try:
        while running:
            if not camera or not camera.isOpened():
                camera = cv2.VideoCapture(0)
                await asyncio.sleep(1)

            success, frame = camera.read()
            if not success:
                await asyncio.sleep(0.1)
                continue
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

