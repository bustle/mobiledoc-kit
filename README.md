## Content-Kit Editor [![Build Status](https://travis-ci.org/bustlelabs/content-kit-editor.svg?branch=master)](https://travis-ci.org/bustlelabs/content-kit-editor)

[![Join the chat at https://gitter.im/bustlelabs/content-kit-editor](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/bustlelabs/content-kit-editor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Content-Kit (WARNING: alpha!!) is a WYSIWYG editor supporting rich content via cards. Try a
demo at [bustlelabs.github.io/content-kit-editor/demo](http://bustlelabs.github.io/content-kit-editor/demo/).

* It makes limited use of Content Editable, the siren-song of doomed web editor
  technologies.
* Content-Kit is designed for *rich* content. We call these sections of an
  article "cards", and implementing a new one doesn't require an understanding
  of Content-Kit internals. Adding a new card takes an afternoon, not several
  days.
* Posts are serialized to a JSON payload called **Mobiledoc** instead of to
  HTML. Mobiledoc can be rendered for the web, mobile web, or in theory on any
  platform. Mobiledoc is portable and fast.

To learn more about Content-Kit in the abstract,
[read this announcement blog post](http://madhatted.com/2015/7/31/announcing-content-kit-and-mobiledoc).

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
  ]]
};
var element = document.querySelector('#editor');
var options = { mobiledoc: simpleMobiledoc };
var editor = new ContentKit.Editor(options);
editor.render(element);
```

`options` is an object which may include the following properties:

* `placeholder` - default text to show before a user starts typing.
* `spellcheck` - a boolean option enabling spellcheck. Default is true.
* `autofocus` - a boolean option for grabbing input focus when an editor is
  rendered.
* `cards` - an object describing available cards.

### Editor API

* `editor.serialize()` - serialize the current post for persistence. Returns
  Mobiledoc.
* `editor.destroy()` - teardown the editor event listeners, free memory etc.
* `editor.disableEditing()` - stop the user from being able to edit the
  current post with their cursor. Programmatic edits are still allowed.
* `editor.enableEditing()` - allow the user to make direct edits directly
  to a post's text.

### Editor Lifecycle Hooks

API consumers may want to react to given interaction by the user (or by
a programmatic edit of the post). Lifecyle hooks provide notification
of change and opportunity to edit the post where appropriate.

Register a lifecycle hook by calling the hook name on the editor with a
callback function. For example:

```js
editor.didUpdatePost(postEditor => {
  let { offsets } = editor.offsets,
      cursorSection;

  if (offset.headSection.text === 'add-section-when-i-type-this') {
    let section = editor.builder.createMarkupSection('p');
    postEditor.insertSectionBefore(section, cursorSection.next);
    cursorSection = section;
  }

  postEditor.scheduleRerender();
  postEditor.schedule(() => {
    if (cursorSection) {
      editor.moveToSection(cursorSection, 0);
    }
  });
});
```

The available lifecycle hooks are:

* `editor.didUpdatePost(postEditor => {})` - An opportunity to use the
  `postEditor` and possibly change the post before rendering begins.
* `editor.willRender()` - After all post mutation has finished, but before
   the DOM is updated.
* `editor.didRender()` - After the DOM has been updated to match the
  edited post.
* `editor.cursorDidChange()` - When the cursor (or selection) changes as a result of arrow-key
  movement or clicking in the document.

### Programmatic Post Editing

A major goal of Content-Kit is to allow complete customization of user
interfaces using the editing surface. The programmatic editing API allows
the creation of completely custom interfaces for buttons, hot-keys, and
other interactions.

To change the post in code, use the `editor.run` API. For example, the
following usage would mark currently selected text as "strong":

```js
editor.run(postEditor => {
  postEditor.toggleMarkup('strong');
});
```

It is important that you make changes to posts, sections, and markers through
the `run` and `postEditor` API. This API allows Content-Kit to conserve
and better understand changes being made to the post.

For more details on the API of `postEditor`, see the [API documentation](https://github.com/bustlelabs/content-kit-editor/blob/master/src/js/editor/post.js).

For more details on the API for the builder, required to create new sections
and markers, see the [builder API](https://github.com/bustlelabs/content-kit-editor/blob/master/src/js/models/post-node-builder.js).

### Configuring hot keys and text expansions

Content-Kit allows configuring hot keys and text expansions. For instance, the
hot-key command-B to make selected text bold, is registered internally as:
```javascript
const boldKeyCommand = {
  modifier: META,
  str: 'B',
  run(editor) {
    editor.run(postEditor => postEditor.toggleMarkup('strong'));
  }
};
editor.registerKeyCommand(boldKeyCommand);
```

All key commands must have `modifier`, `str` and `run` properties as shown above.

Text expansions can also be registered with the editor. These are methods that
are run when a text string is entered and then a trigger character is entered.
For example, the text `"*"` followed by a space character triggers a method that
turns the current section into a list item. To register a text expansion call
`editor.registerExpansion` with an object that has `text`, `trigger` and `run`
properties, e.g.:

```javascript
const expansion = {
  trigger: ' ',
  text: 'X',
  run(editor) {
    // use the editor to programmatically change the post
  }
};
```

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

#### Releasing

* `npm version patch` or `minor` or `major`
* `npm run build`
* `git push <origin> --follow-tags`
* `npm publish`

#### Re-deploy the demo

The demo website is hosted at github pages. To publish a new version:

  * `npm run build-website` - This builds the website into `website/` and commits it
  * `npm run deploy-website` - Pushes the `website/` subtree to the `gh-pages`
     branch of your `origin` at github

Visit [bustlelabs.github.io/content-kit-editor/demo](http://bustlelabs.github.io/content-kit-editor/demo).

*Development of Content-Kit was generously funded by [Bustle Labs](http://www.bustle.com/labs). Bustle Labs is the tech team behind the editorial staff at [Bustle](http://www.bustle.com), a fantastic and successful feminist and women’s interest site based in NYC.*
