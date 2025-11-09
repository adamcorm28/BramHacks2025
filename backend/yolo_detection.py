from ultralytics import YOLO
import cv2


class YOLOModel(object):
    def __init__(self):
        self.model = YOLO("yolov8n.pt")


    def detectObjects(self, frame):
        results = self.model(frame, stream=False, verbose=False)
        annotated = results[0].plot()

        success, annot_img = cv2.imencode(".jpg", annotated)

        if success:
            return annot_img
        else:
            return None



