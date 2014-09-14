# ContentKit-Editor [![Build Status](https://travis-ci.org/ContentKit/content-kit-editor.svg?branch=master)](https://travis-ci.org/ContentKit/content-kit-editor)

A modern, minimalist WYSIWYG editor.

![screenshot]
(https://rawgit.com/ContentKit/content-kit-editor/master/screenshot.png)

*ContentKit-Editor is currently under heavy active development.  API subject to change.*

## Building
1. Install dependencies: `npm install`
2. Build: `gulp build`

## Playing
1. Build
2. Copy or rename `server/config.example.json` to `server/config.json`. Then optionally add your credentials to the file for image uploading and embedding.
3. Start the server: `npm start`
4. Navigate to the demo at [http://localhost:5000](http://localhost:5000)

## Testing
`gulp test`

## Dev tips
- `gulp watch` to auto build/test as you save files

---
