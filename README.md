# ContentKit-Editor [![Build Status](https://travis-ci.org/bustlelabs/content-kit-editor.svg?branch=master)](https://travis-ci.org/bustlelabs/content-kit-editor)
### A modern, minimalist WYSIWYG editor.

*Currently under heavy active development.  API subject to change.*

## Live Demo
[http://content-kit.herokuapp.com/](http://content-kit.herokuapp.com/)

## Prerequisites
* [node.js](http://nodejs.org/) ([install package](http://nodejs.org/download/)) or `brew install node`

## Server Configuration (optional)
For uploads and embeds to work, you will have to configure AWS and Embedly keys as environment variables:
```bash
export AWS_ACCESS_KEY_ID=XXXXXX
export AWS_SECRET_ACCESS_KEY=XXXXXX
export EMBEDLY_KEY=XXXXXX
```
Also, set the `bucketName` in `server/config.json` with the name of your AWS S3 bucket for uploading files. 

## Playing
1. Install dependencies: `npm install`
2. Build: `gulp build`
3. Start server: `npm start` then visit [http://localhost:5000](http://localhost:5000) || To play without the server, simply open [demo/index.html](demo/index.html)

## Testing
`gulp test`

## Dev tips
`gulp watch` to auto build/test as you save files
