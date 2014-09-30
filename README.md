# ContentKit-Editor [![Build Status](https://travis-ci.org/ContentKit/content-kit-editor.svg?branch=master)](https://travis-ci.org/ContentKit/content-kit-editor)
### A modern, minimalist WYSIWYG editor.

![screenshot]
(https://rawgit.com/ContentKit/content-kit-editor/master/screenshot.png)

*Currently under heavy active development.  API subject to change.*

## Prerequisites
* [node.js](http://nodejs.org/) ([install package](http://nodejs.org/download/)) or `brew install node`

## Configuration (optional)
For embeds and image uploads, you will have to configure the built-in server:  
Rename `server/config.example.json` to `server/config.json` and enter your AWS credentials in the file.

## Playing
1. Install dependencies: `npm install`
2. Build: `gulp build`
3. Start server: `npm start` then visit [http://localhost:5000](http://localhost:5000) || To play without the server, simply open [demo/index.html](demo/index.html)

## Testing
`gulp test`

## Dev tips
- `gulp watch` to auto build/test as you save files
