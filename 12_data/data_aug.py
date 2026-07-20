from PIL import Image, ImageEnhance, ImageOps #이미지 증강
import matplotlib.pyplot as plt

# 1. 이미지 로드
img = Image.open("12_data/captured_images/result_20260720_093001.jpg")

# 2. 이미지 증강
img_rotated = img.rotate(90)

# 2-1. 이미지 증강(밝기 조절)
enhancer = ImageEnhance.Brightness(img)
img_brightness = enhancer.enhance(0.5)

# 2-2. 이미지 증강(좌우 반전)
img_flip = ImageOps.mirror(img)

# 3. 결과 시각화 하기
fig, ax = plt.subplots(2, 3, figsize=(20, 10))

# 3-1. 
ax[0,0].imshow(img)
ax[0,0].axis('off')
ax[0,0].set_title("Original")

# 3-2. 회전 이미지
ax[0,1].imshow(img)
ax[0,1].axison('on')
ax[0,1].set_title("Rotated_90")

# 3-3. 이미지 밝기
ax[0,1].imshow(img)
ax[0,1].axison('on')
ax[0,1].set_title("Brightness")

# 3-4. 이미지
ax[1,0].imshow(img)
ax[1,0].axison('on')
ax[1,0].set_title("flip")

plt.show()

img_rotated.save("./captured_images/img_rotated.jpg")
img_brightness.save("./captured_images/img_brightness.jpg")
img_flip.save("./captured_images/img_flip.jpg")

print("사진을 잘 저장했습니다.")