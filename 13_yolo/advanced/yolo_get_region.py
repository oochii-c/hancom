from ultralytics import solutions
import cv2

# 1. video src route
cap = cv2.VideoCapture("http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8")

# 2. defining mouse event counter function
points = []
def mouse_callback(event, x, y, flags, params):
    if event == cv2.EVENT_LBUTTONDOWN: # tracking mouse's left button 
        points.append((x, y))
        print(f"the point you clicked is {x, y}.")

# 3. setting pop-up window and enroll fuction
cv2.namedWindow("GET_X_Y", cv2.WINDOW_NORMAL)
cv2.setMouseCallback("GET_X_Y", mouse_callback)

# 4. video frame handler
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("frame reading failed")
        break
    
    # 4-1. resizing frame
    re_frame = cv2.resize(frame, (640, 480))

    # 4-2. frame visualising
    cv2.imshow("GET_X_Y", re_frame)

    # 4-3. terminate with q button
    if cv2.waitKey(2) & 0xFF == ord('q'):
        print("terminate")
        break

# 5. release
cap.release()
cv2.destroyAllWindows()

# 6. instruction
#left upper = 1
#left under = 2
#right upper = 3
#right under = 4