#!/bin/bash

cd demo/
echo "Building website in $(pwd)"
rm -rf node_modules/ bower_components/*
npm install
bower install
ember build --environment production
cd ..

echo "Arranging built website in $(pwd)/website"
rm -rf website
mkdir -p website/demo

echo "Copying $(pwd)/demo/dist/* to $(pwd)/website/demo"
cp -R demo/dist/* website/demo/

CURRENT_SHA="$(git rev-parse HEAD)"
git add website/
git commit -m "built website from $CURRENT_SHA"
echo "Deployed to http://bustlelabs.github.io/mobiledoc-kit/demo/"
