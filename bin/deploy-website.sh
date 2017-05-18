#!/bin/bash

git push origin `git subtree split --prefix website`:gh-pages --force
echo "Deployed to http://bustle.github.io/mobiledoc-kit/demo/"
