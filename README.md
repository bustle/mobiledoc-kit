## Content-Kit Editor [![Build Status](https://travis-ci.org/bustlelabs/content-kit-editor.svg?branch=master)](https://travis-ci.org/bustlelabs/content-kit-editor)

Content-Kit is a WYSIWYG editor supporting rich content via cards. Try a
demo at [content-kit.herokuapp.com](http://content-kit.herokuapp.com/).

* It makes limited use of Content Editable, the siren-song of doomed web editor
  technologies.
* Content-Kit is designed for *rich* content. We call these sections of an
  article "cards", and implementing a new one doesn't require an understanding
  of Content-Kit internals. Adding a new card take an afternoon, not several
  days.
* Posts are serialized to a JSON payload called **Mobiledoc** instead of to
  HTML. Mobiledoc can be rendered for the web, mobile web, or in theory on any
  platform. Mobiledoc is portable and fast.

To learn more about Content-Kit in the abstract,
[read this announcement blog post](http://madhatted.com/2015/7/27/announcing-content-kit-and-mobiledoc).

Content-Kit saves posts to
**[Mobiledoc](https://github.com/bustlelabs/content-kit-editor/blob/master/MOBILEDOC.md)**.

### Usage

The `ContentKit.Editor` class is invoked with an element to render into and
optionally a Mobiledoc to load. For example:

```js
var simpleMobiledoc = {
  version: "0.1",
  sections: [[], [
    [1, "p", [
      [[], 0, "Welcome to Content-Kit"]
    ]]
  ]
};
var element = $('#editor')[0];
var options = { mobiledoc: simpleMobiledoc };
var editor = new ContentKit.Editor(element, options);
```

`options` is an object which may include the following properties:

* `stickyToolbar` - a boolean option enabling a persistent header with
  formatting tools. Default is true for touch devices.
* `placeholder` - default text to show before a user starts typing.
* `spellcheck` - a boolean option enabling spellcheck. Default is true.
* `autofocus` - a boolean option for grabbing input focus when an editor is
  rendered.
* `cards` - an object describing available cards.

### Editor API

* `editor.serialize()` - serialize the current post for persistence. Returns
  Mobiledoc.
* `editor.destroy()` - teardown the editor event listeners, free memory etc.

### Contributing

Fork the repo, write a test, make a change, open a PR.

#### Tests

Install npm and bower:

  * [Node.js](http://nodejs.org/) is required
  * `npm install -g npm && npm install -g bower`
  * `broccoli`, via `npm install -g broccoli-cli`
  * `bower install`
  * `npm install`

Run tests via the built-in broccoli server:

  * `broccoli serve`
  * `open http://localhost:4200/tests`

Or run headless tests via testem:

  * `npm test`

To quickly view the demo:

  * `broccoli serve`
  * open http://localhost:4200/demo
  * Image uploads and embeds are not supported running in this manner.

To view the full demo with uploads and embed, you will have to configure AWS
and Embedly keys as environment variables:

```bash
export AWS_ACCESS_KEY_ID=XXXXXX
export AWS_SECRET_ACCESS_KEY=XXXXXX
export EMBEDLY_KEY=XXXXXX
```

Also set the `bucketName` in `server/config.json` with the name of your AWS
S3 bucket for uploading files.

Then to boot the server:

```
node server/index.js
```

And visit [localhost:5000/dist/demo/index.html](http://localhost:5000/dist/demo/index.html)

#### Re-deploy the demo

The demo website is hosted at github pages. To publish a new version:

  * `npm run build-website` - This builds the website into `website/` and commits it
  * `npm run deploy-website` - Pushes the `website/` subtree to the `gh-pages`
     branch of your `origin` at github

Visit [bustlelabs.github.io/content-kit-editor/demo](http://bustlelabs.github.io/content-kit-editor/demo).

*Development of Content-Kit was generously funded by [Bustle Labs](http://www.bustle.com/labs). Bustle Labs is the tech team behind the editorial staff at [Bustle](http://www.bustle.com), a fantastic and successful feminist and women’s interest site based in NYC.*
