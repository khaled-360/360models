find ./src -type f -print0 | while IFS= read -r -d '' file; do
  sed -E -i \
    's#(from[[:space:]]+["'\'']\.?\.\/[^"'\'' ]*)(["'\''])#\1.js\2#g' "$file"
done