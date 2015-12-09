## Mobiledoc Kit [![Build Status](https://travis-ci.org/bustlelabs/mobiledoc-kit.svg?branch=master)](https://travis-ci.org/bustlelabs/mobiledoc-kit)

![Mobiledoc Logo](https://raw.githubusercontent.com/bustlelabs/mobiledoc-kit/master/demo/public/images/mobiledoc-logo-color-small.png)

[![Join the chat at https://gitter.im/bustlelabs/mobiledoc-kit](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/bustlelabs/mobiledoc-kit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Mobiledoc Kit (warning: beta) is a library for building WYSIWYG editors
supporting rich content via cards.

**Try a demo at [bustlelabs.github.io/mobiledoc-kit/demo](http://bustlelabs.github.io/mobiledoc-kit/demo/)**.

* Posts are serialized to a JSON format called **Mobiledoc** instead of to
  HTML. Mobiledoc can be rendered for the web, mobile web, or in theory on any
  platform. Mobiledoc is portable and fast.
* The editor makes limited use of Content Editable, the siren-song of doomed
  web editor technologies.
* Mobiledoc is designed for *rich* content. We call these sections of an
  article "cards", and implementing a new one doesn't require an understanding
  of Mobiledoc editor internals. Adding a new card takes an afternoon, not several
  days. To learn more about cards and mobiledoc renderers, see the **[Cards docs](https://github.com/bustlelabs/mobiledoc-kit/blob/master/CARDS.md)**.

To learn more about the ideas behind Mobiledoc and the editor (note that the
editor used to be named Content-Kit), see these blog posts:

* [The Content-Kit announcement post](http://madhatted.com/2015/7/31/announcing-content-kit-and-mobiledoc).
* [Building the Content-Kit Editor on Content Editable](https://medium.com/@bantic/building-content-kit-editor-on-contenteditable-99a94871c951)
* [Content-Kit: Programmatic Editing](http://madhatted.com/2015/8/25/content-kit-programmatic-editing)

The Mobiledoc kit saves posts in
**[Mobiledoc format](https://github.com/bustlelabs/mobiledoc-kit/blob/master/MOBILEDOC.md)**.

### Usage

The `Mobiledoc.Editor` class is invoked with an element to render into and
optionally a Mobiledoc to load. For example:

```js
var simpleMobiledoc = {
  version: "0.1",
  sections: [[], [
    [1, "p", [
      [[], 0, "Welcome to Mobiledoc"]
    ]]
  ]]
};
var element = document.querySelector('#editor');
var options = { mobiledoc: simpleMobiledoc };
var editor = new Mobiledoc.Editor(options);
editor.render(element);
```

`options` is an object which may include the following properties:

* `placeholder` - [string] default text to show before a user starts typing.
* `spellcheck` - [boolean] whether to enable spellcheck. Defaults to true.
* `autofocus` - [boolean] When true, focuses on the editor when it is rendered.
* `cards` - [array] The list of cards that the editor may render
* `cardOptions` - [object] Options passed to 
* `unknownCardHandler` - [function] This will be invoked by the editor-renderer whenever it encounters an unknown card

### Editor API

* `editor.serialize()` - serialize the current post for persistence. Returns
  Mobiledoc.
* `editor.destroy()` - teardown the editor event listeners, free memory etc.
* `editor.disableEditing()` - stop the user from being able to edit the
  current post with their cursor. Programmatic edits are still allowed.
* `editor.enableEditing()` - allow the user to make direct edits directly
  to a post's text.
* `editor.editCard(cardSection)` - change the card to its edit mode (will change
  immediately if the card is already rendered, or will ensure that when the card
  does get rendered it will be rendered in the "edit" state initially)
* `editor.displayCard(cardSection)` - same as `editCard` except in display mode.

### Editor Lifecycle Hooks

API consumers may want to react to given interaction by the user (or by
a programmatic edit of the post). Lifecyle hooks provide notification
of change and opportunity to edit the post where appropriate.

Register a lifecycle hook by calling the hook name on the editor with a
callback function. For example:

```js
editor.didUpdatePost(postEditor => {
  let { offsets } = editor.cursor,
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

A major goal of the Mobiledoc kit is to allow complete customization of user
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
the `run` and `postEditor` API. This API allows the Mobiledoc editor to conserve
and better understand changes being made to the post.

For more details on the API of `postEditor`, see the [API documentation](https://github.com/bustlelabs/mobiledoc-kit/blob/master/src/js/editor/post.js).

For more details on the API for the builder, required to create new sections
and markers, see the [builder API](https://github.com/bustlelabs/mobiledoc-kit/blob/master/src/js/models/post-node-builder.js).

### Configuring hot keys

The Mobiledoc editor allows the configuration of hot keys and text expansions.
For instance, the hot-key command-B to make selected text bold, is registered
internally as:

```javascript
const boldKeyCommand = {
  str: 'META+B',
  run(editor) {
    editor.run(postEditor => postEditor.toggleMarkup('strong'));
  }
};
editor.registerKeyCommand(boldKeyCommand);
```

All key commands must have `str` and `run` properties as shown above.

`str` describes the key combination to use and may be a single key, or modifier(s) and a key separated by `+`, e.g.: `META+K` (cmd-K), `META+SHIFT+K` (cmd-shift-K)

Modifiers can be any of `CTRL`, `META`, `SHIFT`, or `ALT`.

The key can be any of the alphanumeric characters on the keyboard, or one of the following special keys:

`BACKSPACE`, `TAB`, `ENTER`, `ESC`, `SPACE`, `PAGEUP`, `PAGEDOWN`, `END`, `HOME`, `LEFT`, `UP`, `RIGHT`, `DOWN`, `INS`, `DEL`

#### Overriding built-in keys

You can override built-in behavior by simply registering a hot key with the same name.
For example, to submit a form instead of entering a new line when `enter` is pressed you could do the following:

```javascript
const enterKeyCommand = {
  str: 'enter',
  run(editor) {
    // submit the form
  }
};
editor.registerKeyCommand(enterKeyCommand);
```

To fall-back to the default behavior, return `false` from `run`.

### Configuring text expansions

Text expansions can also be registered with the editor. These are functions that
are run when a text string is entered and then a trigger character is entered.
For example, the text `"*"` followed by a space character triggers a function that
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

### DOM Parsing hooks

A developer can override the default parsing behavior for leaf DOM nodes in
pasted HTML.

For example, when an `img` tag is pasted it may be appropriate to
fetch that image, upload it to an authoritative source, and create a specific
kind of image card with the new URL in its payload.

A demonstration of this:

```js
function imageToCardParser(node, builder, {addSection, addMarkerable, nodeFinished}) {
  if (node.nodeType !== 1 || node.tagName !== 'IMG') {
    return;
  }
  var payload = { src: node.src };
  var cardSection = builder.createCardSection('my-image', payload);
  addSection(cardSection);
  nodeFinished();
}
var options = {
  parserPlugins: [imageToCardParser]
};
var editor = new Mobiledoc.Editor(options);
var element = document.querySelector('#editor');
editor.render(element);
```

Parser hooks are called with two arguments:

* `node` - The node of DOM being parsed. This may be a text node or an element.
* `builder` - The abstract model builder.
* `env` - An object containing three callbacks to modify the abstract
  * `addSection` - Close the current section and add a new one
  * `addMarkerable` - Add a markerable (marker or atom) to the current section
  * `nodeFinished` - Bypass all remaining parse steps for this node

Note that you *must* call `nodeFinished` to stop a DOM node from being
parsed by the next plugin or the default parser.

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

#### Demo

There is a demo app that uses the Mobiledoc kit via the [ember-mobiledoc-editor](https://github.com/bustlelabs/ember-mobiledoc-editor)
in `demo/`. To run the demo:

 * `cd demo/ && npm install && bower install`
 * `ember serve` (shut down your broccoli server if it is already running on port 4200)
 * visit http://localhost:4200/

#### Releasing

* `npm version patch` or `minor` or `major`
* `npm run update-changelog`
* `npm run build`
* `git push <origin> --follow-tags`
* `npm publish`

#### Deploy the demo

The demo website is hosted at github pages. To publish a new version:

  * `npm run build-website` - This builds the website into `website/` and commits it
  * `npm run deploy-website` - Pushes the `website/` subtree to the `gh-pages`
     branch of your `origin` at github

Visit [bustlelabs.github.io/mobiledoc-kit/demo](http://bustlelabs.github.io/mobiledoc-kit/demo).

*Development of Mobiledoc and the supporting libraries was generously funded by [Bustle Labs](http://www.bustle.com/labs). Bustle Labs is the tech team behind the editorial staff at [Bustle](http://www.bustle.com), a fantastic and successful feminist and women’s interest site based in NYC.*
