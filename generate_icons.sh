#!/bin/bash
set -e

mkdir -p src-tauri/icons/icon.iconset

SOURCE="src-tauri/icons/icon.png"
DEST="src-tauri/icons/icon.iconset"

# Resize to standard sizes
sips -s format png -z 16 16     "$SOURCE" --out "$DEST/icon_16x16.png"
sips -s format png -z 32 32     "$SOURCE" --out "$DEST/icon_16x16@2x.png"
sips -s format png -z 32 32     "$SOURCE" --out "$DEST/icon_32x32.png"
sips -s format png -z 64 64     "$SOURCE" --out "$DEST/icon_32x32@2x.png"
sips -s format png -z 128 128   "$SOURCE" --out "$DEST/icon_128x128.png"
sips -s format png -z 256 256   "$SOURCE" --out "$DEST/icon_128x128@2x.png"
sips -s format png -z 256 256   "$SOURCE" --out "$DEST/icon_256x256.png"
sips -s format png -z 512 512   "$SOURCE" --out "$DEST/icon_256x256@2x.png"
sips -s format png -z 512 512   "$SOURCE" --out "$DEST/icon_512x512.png"
sips -s format png -z 1024 1024 "$SOURCE" --out "$DEST/icon_512x512@2x.png"

# Compile to icns
iconutil -c icns "$DEST" -o src-tauri/icons/icon.icns

# Copy to standalone files expected by tauri.conf.json
cp "$DEST/icon_32x32.png" src-tauri/icons/32x32.png
cp "$DEST/icon_128x128.png" src-tauri/icons/128x128.png
cp "$DEST/icon_128x128@2x.png" src-tauri/icons/128x128@2x.png

# Create a temporary ICO. Since we don't have proper tools, we copy the 32x32 png.
# This might fail on some rigorous checks but usually works for dev.
cp src-tauri/icons/32x32.png src-tauri/icons/icon.ico

echo "Icons generated successfully."
