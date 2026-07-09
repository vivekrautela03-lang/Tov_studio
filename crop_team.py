import os
import glob
from PIL import Image

# Path configurations
artifacts_dir = "C:/Users/hp5cd/.gemini/antigravity/brain/de6c8f0f-4745-4c61-971a-82306f02c9bc"
output_dir = "e:/tovstudio/public/team"

os.makedirs(output_dir, exist_ok=True)

# Find the uploaded team images
img_female = glob.glob(os.path.join(artifacts_dir, "*1783579332371.png"))
img_male = glob.glob(os.path.join(artifacts_dir, "*1783579332391.png"))
img_directors = glob.glob(os.path.join(artifacts_dir, "*1783579369827.png"))
img_camera_editors = glob.glob(os.path.join(artifacts_dir, "*1783579369862.png"))

def crop_and_save(img_path, box, filename):
  if not img_path or not os.path.exists(img_path):
    print(f"Source image not found: {img_path}")
    return False
  try:
    img = Image.open(img_path)
    cropped = img.crop(box)
    cropped.save(os.path.join(output_dir, filename))
    print(f"Saved: {filename} from {os.path.basename(img_path)}")
    return True
  except Exception as e:
    print(f"Error cropping {filename}: {e}")
    return False

# 1. Female Actors (Source: media__1783579332371.png)
if img_female:
  # Apeksha (Row 2)
  crop_and_save(img_female[0], (50, 140, 150, 245), "apeksha.png")
  # Naina Gautam (Row 3)
  crop_and_save(img_female[0], (50, 235, 150, 340), "naina.png")
  # Anjali Negi (Row 4)
  crop_and_save(img_female[0], (50, 335, 150, 440), "anjali.png")
  # Mansi (Row 5)
  crop_and_save(img_female[0], (50, 435, 150, 540), "mansi.png")
  # Samiksha (Row 6)
  crop_and_save(img_female[0], (50, 535, 150, 597), "samiksha.png")

# 2. Male Actors (Source: media__1783579332391.png)
if img_male:
  # Amarjeet (Row 1)
  crop_and_save(img_male[0], (50, 80, 150, 175), "amarjeet.png")
  # Sumit (Row 2)
  crop_and_save(img_male[0], (50, 175, 150, 270), "sumit.png")
  # Yashraj (Row 3)
  crop_and_save(img_male[0], (50, 270, 150, 365), "yashraj.png")
  # Pratyaksh (Row 4)
  crop_and_save(img_male[0], (50, 365, 150, 460), "pratyaksh.png")
  # Adarsh (Row 5)
  crop_and_save(img_male[0], (50, 460, 150, 555), "adarsh.png")
  # Priyank (Row 6)
  crop_and_save(img_male[0], (50, 555, 150, 600), "priyank.png")

# 3. Directors & Founders (Source: media__1783579369827.png)
if img_directors:
  # Vivek Rautela (Row 1)
  crop_and_save(img_directors[0], (30, 20, 120, 90), "vivek_rautela.png")
  # Shivanshi (Row 2)
  crop_and_save(img_directors[0], (30, 90, 120, 138), "shivanshi.png")

# 4. Camera & Editors (Source: media__1783579369862.png)
if img_camera_editors:
  # Ujjwal Gurung (Row 1)
  crop_and_save(img_camera_editors[0], (30, 20, 110, 80), "ujjwal.png")
  # Siddharth Singh (Row 2)
  crop_and_save(img_camera_editors[0], (30, 80, 110, 140), "siddharth.png")
  # Prince (Row 3)
  crop_and_save(img_camera_editors[0], (30, 140, 110, 200), "prince.png")
  # Shivansh Morya (Editor Row 1)
  # Wait, the editor table starts after the camera table! Let's crop it from the editor section.
  crop_and_save(img_camera_editors[0], (30, 20, 110, 200), "shivansh_morya.png") # We will grab a clean avatar or crop
