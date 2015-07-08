#!/bin/bash

echo "Building website..."
npm run build

echo "Arranging built website in website/"
rm -rf website
mkdir website

# rename demo/website-index.html to be the base index.html
cp dist/demo/website-index.html website/index.hml

# selectively copy asset dirs from dist to the staging area
cp -R dist/demo website/demo
cp -R dist/css website/css
cp -R dist/global website/global

CURRENT_SHA="$(git rev-parse HEAD)"
git add website/
git commit -m "built website from $CURRENT_SHA"
echo "Done."
