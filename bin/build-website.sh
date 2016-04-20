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

echo "Copying $(pwd)/docs to $(pwd)/website/demo"
mkdir -p website/demo/docs
cp -R docs/* website/demo/docs/

CURRENT_SHA="$(git rev-parse HEAD)"
git add website/
git commit -m "built website from $CURRENT_SHA"
echo "Built and committed as $CURRENT_SHA"
