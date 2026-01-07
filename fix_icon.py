from PIL import Image, ImageDraw

def fix_icon():
    source_path = "src-tauri/icons/icon.png"
    print(f"Opening {source_path}...")
    img = Image.open(source_path).convert("RGBA")
    
    # 1. Flood fill corners with transparency to remove the white background
    # Using a threshold to catch JPEG compression artifacts (near-white)
    # 50 is a somewhat aggressive threshold (out of 255) to catch shadows/artifacts
    thresh = 50 
    
    # Draw on the image in place
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=thresh)
    w, h = img.size
    # Check other corners just in case, though usually 0,0 connects to all
    ImageDraw.floodfill(img, (w-1, 0), (0, 0, 0, 0), thresh=thresh)
    ImageDraw.floodfill(img, (0, h-1), (0, 0, 0, 0), thresh=thresh)
    ImageDraw.floodfill(img, (w-1, h-1), (0, 0, 0, 0), thresh=thresh)
    
    # 2. Crop to the content (remove the transparent margins we just created)
    # This centers the icon and removes excess whitespace
    bbox = img.getbbox()
    if bbox:
        print(f"Cropping to content bounding box: {bbox}")
        img = img.crop(bbox)
    
    # 3. Resize to standard size with padding (standard macOS icons have ~10-15% padding)
    # Target visual size is roughly 824x824 within the 1024x1024 box to match standard dock icons.
    print("Resizing to 824x824 (with padding)...")
    img = img.resize((824, 824), Image.Resampling.LANCZOS)
    
    # 4. Apply a clean macOS-style squircle mask
    # The mask should apply to the resized visual content, but for simplicity in this "fix" script,
    # we can apply the mask to the 824x824 content directly or just trust the crop.
    # Actually, let's create a full 1024x1024 canvas and paste the 824x824 icon in the center.
    
    final = Image.new("RGBA", (1024, 1024), (0,0,0,0))
    # Center calculation: (1024 - 824) / 2 = 100
    final.paste(img, (100, 100))
    
    # Optional: If we want to enforce the squircle shape strictly on the content itself:
    # (Existing img is likely already the shape we want, just cropped. If we want to mask it again to be super clean:)
    # mask_content = Image.new('L', (824, 824), 0)
    # mask_draw = ImageDraw.Draw(mask_content)
    # mask_draw.rounded_rectangle([(0,0), (824, 824)], radius=160, fill=255)
    # final_composite = Image.new("RGBA", (1024, 1024), (0,0,0,0))
    # temp_content = Image.new("RGBA", (824, 824), (0,0,0,0))
    # temp_content.paste(img, (0,0), mask=mask_content)
    # final.paste(temp_content, (100, 100))

    # However, since we already have the shaped icon from the previous step (just resizing), 
    # and the prompt generated a rounded square, simple scaling and centering is usually sufficient 
    # and safer than double-masking which might cut borders.
    
    final.save(source_path, "PNG")
    print(f"Saved fixed icon (with padding) to {source_path}")

if __name__ == "__main__":
    fix_icon()
