#!/bin/bash

git branch -D gh-pages
git checkout -b gh-pages

CURRENT_SHA="$(git rev-parse HEAD)"
git add dist/website/ -f
git commit -m "Built website from $CURRENT_SHA"

git push origin `git subtree split --prefix dist/website`:gh-pages --force
echo "Deployed to http://bustle.github.io/mobiledoc-kit/demo/"

git checkout master
