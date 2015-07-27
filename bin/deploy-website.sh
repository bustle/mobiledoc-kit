#!/bin/bash

git push origin `git subtree split --prefix website`:gh-pages --force
