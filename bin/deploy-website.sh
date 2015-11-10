#!/bin/bash

git push origin `git subtree split --prefix website`:gh-pages --force
echo "Deployed to http://bustlelabs.github.io/mobiledoc-kit/demo/"
