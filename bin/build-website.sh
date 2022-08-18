#!/bin/bash

echo "Clearing $(pwd)/website"
rm -rf website
mkdir website

echo "Copying demo code to website"
cp -r demo website

echo "Copying build files to demo"
cp -r dist/mobiledoc.* website/demo

echo "Copying docs to website"
cp -r dist/docs website/demo
