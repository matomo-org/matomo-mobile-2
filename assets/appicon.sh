mkdir -p AppIcons && \
for size in 20 29 40 60 76 83.5 1024; do
  for scale in 1 2 3; do
    px=$(printf "%.0f" "$(echo "$size * $scale" | bc)")
    if [ "$px" -le 1024 ]; then
      magick ../DefaultIcon-ios.png -alpha remove  -alpha off  -background "#ffffff" -filter Lanczos -define filter:blur=0.9 -unsharp 0x0.75+0.75+0.02  -resize ${px}x${px} appicon-${size}@${scale}x.png
    fi
  done
done

sizes=(
  20 40 60
  29 58 87
  40 80 120
  60 120 180 108 102 114 144 196 216 234 258 48 50 55 66 88 92
  57 66 72 76 152
  167
  1024
)

for px in "${sizes[@]}"; do
  magick ../DefaultIcon-ios.png -alpha remove  -alpha off  -background "#ffffff" -filter Lanczos -define filter:blur=0.9 -unsharp 0x0.75+0.75+0.02  -resize ${px}x${px} appicon-${px}.png
done


  magick ../DefaultIcon-ios.png -alpha remove  -alpha off  -background "#ffffff" -filter Lanczos -define filter:blur=0.9 -unsharp 0x0.75+0.75+0.02  -resize 57x57 appicon.png
  magick ../DefaultIcon-ios.png -alpha remove  -alpha off  -background "#ffffff" -filter Lanczos -define filter:blur=0.9 -unsharp 0x0.75+0.75+0.02  -resize 114x114 appicon@2x.png
