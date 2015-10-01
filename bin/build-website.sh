#!/bin/bash

echo "Building website..."
cd demo/
rm -rf node_modules/ bower_components/*
npm install
bower install
ember build --environment production

echo "Arranging built website in website/"
rm -rf website
mkdir website

# rename demo/dist/index.html to be the base index.html
cd ..
cp -R demo/dist/* website/

CURRENT_SHA="$(git rev-parse HEAD)"
git add website/
git commit -m "built website from $CURRENT_SHA"
echo "Done."
