import os

from ultralytics import FastSAM
import cv2

# 1. image src route
source = ("13_yolo/advanced/input_fast_sam.png")

# 2. Load FastSAM model
model = FastSAM("FastSAM-s.pt")

# 3. text prompting
results = model(source, texts="dog")

# 4. create visual result
output_path = "output_fast_sam_result.jpg"
output_image = results[0].plot()

# 5. recall and save visual result
cv2.imwrite(output_path, output_image)

# 6. end up code
print(f"visual result successfully saved at {output_path}")