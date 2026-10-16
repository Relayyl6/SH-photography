import os
import json
from PIL import Image, ImageOps

src_root = r"C:\Users\USER\Downloads\New folder (2)\transfer-01a12cf8\New folder"
dest_root = r"public\photos"

categories = {
    "weddings": {"folder": "WEDDING PORTRAITS", "limit": 24, "title": "Weddings"},
    "portraits": {"folder": "PORTRAITS", "limit": 24, "title": "Portraits"},
    "family": {"folder": "FAMILY PORTRAITS", "limit": 24, "title": "Family"},
    "behind-the-scenes": {"folder": "BTS", "limit": 24, "title": "Behind the Scenes"},
    "events": {"folder": "EVENTS", "limit": 24, "title": "Events"},
    "sports": {"folder": "SPORTS", "limit": 24, "title": "Sports"},
    "birthday": {"folder": "BIRTHDAY", "limit": 24, "title": "Birthdays"},
    "personal": {"folder": "PERSONAL", "limit": 9, "title": "Personal Branding"}
}

os.makedirs(dest_root, exist_ok=True)
gallery_data = {}

for slug, conf in categories.items():
    src_folder = os.path.join(src_root, conf["folder"])
    dest_folder = os.path.join(dest_root, slug)
    os.makedirs(dest_folder, exist_ok=True)
    
    files = sorted([f for f in os.listdir(src_folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))])[:conf["limit"]]
    gallery_data[slug] = []
    
    title = conf["title"]
    for idx, fname in enumerate(files):
        src_path = os.path.join(src_folder, fname)
        out_name = f"{slug}_{idx+1:02d}.jpg"
        out_path = os.path.join(dest_folder, out_name)
        
        try:
            with Image.open(src_path) as im:
                im = ImageOps.exif_transpose(im)
                im = im.convert("RGB")
                
                # Resize max dimension to 1400px for web speed and performance
                max_dim = 1400
                w, h = im.size
                if max(w, h) > max_dim:
                    if w > h:
                        new_w = max_dim
                        new_h = int(h * (max_dim / w))
                    else:
                        new_h = max_dim
                        new_w = int(w * (max_dim / h))
                    im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
                else:
                    new_w, new_h = w, h
                
                im.save(out_path, "JPEG", quality=82, optimize=True)
                
                gallery_data[slug].append({
                    "src": f"/photos/{slug}/{out_name}",
                    "width": new_w,
                    "height": new_h,
                    "aspectRatio": round(new_w / new_h, 3),
                    "alt": f"{title} photograph {idx+1} by SH Photography",
                    "title": f"{title} · #{idx+1:02d}",
                })
        except Exception as e:
            print(f"Error on {src_path}: {e}")
            
    print(f"Processed {len(gallery_data[slug])} images for {slug}")

with open("lib/gallery-data.json", "w") as f:
    json.dump(gallery_data, f, indent=2)

print("All gallery images processed successfully!")
