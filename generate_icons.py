import os
import subprocess
from PIL import Image

def generate_icons():
    source_path = "src-tauri/icons/icon.png"
    iconset_dir = "src-tauri/icons/icon.iconset"
    
    # Ensure source exists
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found.")
        return

    # Load image
    img = Image.open(source_path)
    # Convert to RGBA
    img = img.convert("RGBA")
    
    # Save back as proper PNG in case it was a JPEG
    img.save(source_path, "PNG")
    print(f"Converted {source_path} to RGBA PNG.")

    # Create iconset directory
    if not os.path.exists(iconset_dir):
        os.makedirs(iconset_dir)

    # Icon sizes for iconset (macOS)
    sizes = [
        (16, "icon_16x16.png"),
        (32, "icon_16x16@2x.png"),
        (32, "icon_32x32.png"),
        (64, "icon_32x32@2x.png"),
        (128, "icon_128x128.png"),
        (256, "icon_128x128@2x.png"),
        (256, "icon_256x256.png"),
        (512, "icon_256x256@2x.png"),
        (512, "icon_512x512.png"),
        (1024, "icon_512x512@2x.png")
    ]

    for size, name in sizes:
        resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
        resized_img.save(os.path.join(iconset_dir, name), "PNG")
    
    print("Generated iconset PNGs.")

    # Generate standalone icons needed by tauri.conf.json
    # 32x32
    img.resize((32, 32), Image.Resampling.LANCZOS).save("src-tauri/icons/32x32.png", "PNG")
    # 128x128
    img.resize((128, 128), Image.Resampling.LANCZOS).save("src-tauri/icons/128x128.png", "PNG")
    # 128x128@2x (256x256)
    img.resize((256, 256), Image.Resampling.LANCZOS).save("src-tauri/icons/128x128@2x.png", "PNG")
    
    print("Generated standalone icons.")

    # Generate ICO (Windows)
    # ICO can contain multiple sizes. Common: 16, 32, 48, 64, 128, 256
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save("src-tauri/icons/icon.ico", format="ICO", sizes=ico_sizes)
    print("Generated icon.ico.")

    # Generate ICNS (macOS) using iconutil
    try:
        subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", "src-tauri/icons/icon.icns"], check=True)
        print("Generated icon.icns.")
    except Exception as e:
        print(f"Failed to generate ICNS: {e}")

    # Cleanup iconset dir if desired, but keeping it for reference is fine.
    # shutil.rmtree(iconset_dir)

if __name__ == "__main__":
    generate_icons()
