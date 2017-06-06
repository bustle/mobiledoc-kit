#!/bin/bash

echo "Clearing $(pwd)/website"
rm -rf website
mkdir website

echo "Copying $(pwd)/dist/* to $(pwd)/website/"
cp -R dist/* website/

echo "Copying $(pwd)/docs to $(pwd)/website/demo/docs"
mkdir -p website/demo/docs
cp -R docs/* website/demo/docs/

CURRENT_SHA="$(git rev-parse HEAD)"
git add website/
git commit -m "built website from $CURRENT_SHA"
echo "Built and committed as $CURRENT_SHA"
