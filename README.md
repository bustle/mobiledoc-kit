# Mobiledoc Kit [![CI Build Status](https://github.com/bustle/mobiledoc-kit/workflows/CI/badge.svg)](https://github.com/bustle/mobiledoc-kit/actions?query=workflow%3ACI)

<img width="300" src="https://bustle.github.io/mobiledoc-kit/demo/mobiledoc-logo-color-small.png" alt="Mobiledoc Logo"/>

Mobiledoc Kit is a framework-agnostic library for building WYSIWYG editors
supporting rich content via cards.

## Libraries

This repository hosts the core Mobiledoc Kit library. If you want to use Mobiledoc Kit to _create a WYSIWYG editor_ you have the following options:

| Environment      | Library                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| Plain JavaScript | [mobiledoc-kit](https://github.com/bustle/mobiledoc-kit) (this repo)         |
| Ember            | [ember-mobiledoc-editor](https://github.com/bustle/ember-mobiledoc-editor)   |
| React            | [react-mobiledoc-editor](https://github.com/upworthy/react-mobiledoc-editor) |

If you only want to use the Mobiledoc-Kit runtime, for _rendering mobiledoc posts only_ (not editing or creating them), you can use:

| Output Format/Environment                                                           | Library                                                                                                                |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Plain JavaScript In-Browser (DOM)                                                   | [mobiledoc-dom-renderer](https://github.com/bustle/mobiledoc-dom-renderer)                                             |
| Server-Side Rendering (HTML)                                                        | see [mobiledoc-dom-renderer's Rendering HTML section](https://github.com/bustle/mobiledoc-dom-renderer#rendering-html) |
| Server-Side Rendering (Text-only, e.g. SEO)                                         | [mobiledoc-text-renderer](https://github.com/bustle/mobiledoc-text-renderer)                                           |
| In-Browser (DOM) Rendering, with Ember                                              | [ember-mobiledoc-dom-renderer](https://github.com/bustle/ember-mobiledoc-dom-renderer)                                 |
| React Server and Browser Renderer                                                   | [mobiledoc-react-renderer](https://github.com/dailybeast/mobiledoc-react-renderer)                                     |
| 🔮 Render Mobiledoc as VDOM by passing React or React-like `createElement` function | [mobiledoc-vdom-renderer](https://github.com/bustle/mobiledoc-vdom-renderer)                                           |

Mobiledoc is a deliberately simple and terse format, and you are encouraged to write your own renderer if you have other target output formats (e.g., a PDF renderer, an iOS Native Views Renderer, etc.).

Other 3rd Party Libraries:

| Environment      | Library                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| Python           | [mobiledoc-py](https://github.com/SuhJae/mobiledoc-py)         |


## Demo

Try a demo at [bustle.github.io/mobiledoc-kit/demo](https://bustle.github.io/mobiledoc-kit/demo/).

## API Documentation

API Documentation is [available online](http://bustle.github.io/mobiledoc-kit/demo/docs/).

## Intro to Mobiledoc Kit

- Posts are serialized to a JSON format called **Mobiledoc** instead of to
  HTML. Mobiledoc can be rendered for the web, mobile web, or in theory on any
  platform. Mobiledoc is portable and fast.
- The editor makes limited use of Content Editable, the siren-song of doomed
  web editor technologies.
- Mobiledoc is designed for _rich_ content. We call rich sections of an
  article "cards" and rich inline elements "atoms" and implementing a new one doesn't require an understanding
  of Mobiledoc editor internals. Adding a new atom or card takes an afternoon, not several
  days. To learn more, see the docs for
  **[Atoms](https://github.com/bustle/mobiledoc-kit/blob/master/ATOMS.md)**,
  **[Cards](https://github.com/bustle/mobiledoc-kit/blob/master/CARDS.md)**
  and
  **[Mobiledoc Renderers](https://github.com/bustle/mobiledoc-kit/blob/master/RENDERERS.md)**

To learn more about the ideas behind Mobiledoc and the editor (note that the
editor used to be named Content-Kit), see these blog posts:

- [The Content-Kit announcement post](http://madhatted.com/2015/7/31/announcing-content-kit-and-mobiledoc).
- [Building the Content-Kit Editor on Content Editable](https://medium.com/@bantic/building-content-kit-editor-on-contenteditable-99a94871c951)
- [Content-Kit: Programmatic Editing](http://madhatted.com/2015/8/25/content-kit-programmatic-editing)

The Mobiledoc kit saves posts in
**[Mobiledoc format](https://github.com/bustle/mobiledoc-kit/blob/master/MOBILEDOC.md)**.

### Usage

The `Mobiledoc.Editor` class is invoked with an element to render into and
optionally a Mobiledoc to load. For example:

```js
const simpleMobiledoc = {
  version: '0.3.2',
  markups: [],
  atoms: [],
  cards: [],
  sections: [[1, 'p', [[0, [], 0, 'Welcome to Mobiledoc']]]],
}
const element = document.querySelector('#editor')
const options = { mobiledoc: simpleMobiledoc }
const editor = new Mobiledoc.Editor(options)
editor.render(element)
```

`options` is an object which may include the following properties:

- `mobiledoc` - [object] A mobiledoc object to load and edit.
- `placeholder` - [string] default text to show before a user starts typing.
- `spellcheck` - [boolean] whether to enable spellcheck. Defaults to true.
- `autofocus` - [boolean] When true, focuses on the editor when it is rendered.
- `undoDepth` - [number] How many undo levels should be available. Default
  value is five. Set this to zero to disable undo/redo.
- `cards` - [array] The list of cards that the editor may render
- `atoms` - [array] The list of atoms that the editor may render
- `cardOptions` - [object] Options passed to cards and atoms
- `unknownCardHandler` - [function] This will be invoked by the editor-renderer
  whenever it encounters an unknown card
- `unknownAtomHandler` - [function] This will be invoked by the editor-renderer
  whenever it encounters an unknown atom
- `parserPlugins` - [array] See [DOM Parsing Hooks](https://github.com/bustle/mobiledoc-kit#dom-parsing-hooks)
- `tooltipPlugin` - [object] Optional plugin for customizing tooltip appearance

The editor leverages unicode characters, so HTML documents must opt in to
UTF8. For example this can be done by adding the following to an HTML
document's `<head>`:

```html
<meta charset="utf-8" />
```

### Editor API

- `editor.serialize(version="0.3.2")` - serialize the current post for persistence. Returns
  Mobiledoc.
- `editor.destroy()` - teardown the editor event listeners, free memory etc.
- `editor.disableEditing()` - stop the user from being able to edit the
  current post with their cursor. Programmatic edits are still allowed.
- `editor.enableEditing()` - allow the user to make edits directly
  to a post's text.
- `editor.editCard(cardSection)` - change the card to its edit mode (will change
  immediately if the card is already rendered, or will ensure that when the card
  does get rendered it will be rendered in the "edit" state initially)
- `editor.displayCard(cardSection)` - same as `editCard` except in display mode.
- `editor.range` - Read the current Range object for the cursor.

### Position API

A `Position` object represents a location in a document. For example your
cursor may be at a position, text may be inserted at a position, and a range
has a starting position and an ending position.

Position objects are returned by several APIs, for example `deleteRange` returns
a position. Some methods, like `splitSection` accept a position as an argument.

A position can be created for any point in a document with
`section#toPosition(offset)`.

Position API includes:

- `position.section` - The section of this position
- `position.offset` - The character offset of this position in the section.
- `position.marker` - Based on the section and offset, the marker this position
  is on. A position may not always have a marker (for example a cursor before
  or after a card).
- `position.toRange(endPosition)` - Create a range based on two positions. Accepts
  the direction of the range as a second optional argument.
- `position.isEqual(otherPosition)` - Is this position the same as another
- `position.move(characterCount)` - Move a number of characters to the right
  (positive number) or left (negative number)
- `position.moveWord(direction)` - Move a single word in a given direction.

### Range API

`Range` represents a range of a document. A range has a starting position
(`head`), ending position (`tail`), and a direction (for example highlighting
text left-to-right is a forward direction, highlighting right-to-left is a
backward direction).

Ranges are returned by several APIs, but most often you will be interested in
the current range selected by the user (be it their cursor or an actual
selection). This can be accessed at `editor#range`. Several post editor APIs
expect a range as an argument, for example `setRange` or `deleteRange`.

Ranges sport several public APIs for manipulation, each of which returns a new,
unique range instance:

- `range.head` - The position on the range closer to the start of the document.
- `range.tail` - The position on the range closer to the end of the document.
- `range.isCollapsed` - A range is collapsed when its head and tail are the same
  position.
- `range.focusedPosition` - If a range has a forward direction, then tail. If
  it has a backward direction, then head.
- `range.extend(characterCount)` - Grow a range one character in whatever its
  direction is.
- `range.move(direction)` - If the range is collapsed, move the range forward
  one character. If it is not, collapse it in the direction passed.
- `range.expandByMarker(callback)` - In both directions attempt grow the
  range as long as `callback` returns true. `callback` is passed each marker
  as the range is grown.

### Editor Lifecycle Hooks

API consumers may want to react to given interaction by the user (or by
a programmatic edit of the post). Lifecycle hooks provide notification
of change and opportunity to edit the post where appropriate.

Register a lifecycle hook by calling the hook name on the editor with a
callback function. For example:

```js
editor.didUpdatePost(postEditor => {
  let { range } = editor
  let cursorSection = range.head.section

  if (cursorSection.text === 'add-section-when-i-type-this') {
    let section = editor.builder.createMarkupSection('p')
    postEditor.insertSectionBefore(section, cursorSection.next)
    postEditor.setRange(new Mobiledoc.Range(section.headPosition))
  }
})
```

The available lifecycle hooks are:

- `editor.didUpdatePost(postEditor => {})` - An opportunity to use the
  `postEditor` and possibly change the post before rendering begins.
- `editor.willRender()` - After all post mutation has finished, but before
  the DOM is updated.
- `editor.didRender()` - After the DOM has been updated to match the
  edited post.
- `editor.willDelete((range, direction, unit))` - Provides `range`, `direction` and `unit` to identify the coming deletion.
- `editor.didDelete((range, direction, unit))` - Provides `range`, `direction` and `unit` to identify the completed deletion.
- `editor.cursorDidChange()` - When the cursor (or selection) changes as a result of arrow-key
  movement or clicking in the document.
- `editor.onTextInput()` - When the user adds text to the document (see [example](https://github.com/bustlelabs/mobiledoc-kit#responding-to-text-input))
- `editor.inputModeDidChange()` - The active section(s) or markup(s) at the current cursor position or selection have changed. This hook can be used with `Editor#activeMarkups`, `Editor#activeSections`, and `Editor#activeSectionAttributes` to implement a custom toolbar.
- `editor.beforeToggleMarkup(({markup, range, willAdd}) => {...})` - Register a
  callback that will be called before `editor#toggleMarkup` is applied. If any
  callback returns literal `false`, the toggling of markup will be canceled.
  (Toggling markup done via the postEditor, e.g. `editor.run(postEditor => postEditor.toggleMarkup(...))` will skip this callback.
- `editor.willCopy(({html, text, mobiledoc}) => {...})` - Called before the
  serialized versions of the selected markup is copied to the system
  pasteboard.
  `editor.willPaste(({html, text, mobiledoc}) => {...})` - Called before the
  serialized versions of the system pasteboard is pasted into the mobiledoc.

For more details on the lifecycle hooks, see the [Editor documentation](https://bustle.github.io/mobiledoc-kit/demo/docs/Editor.html).

### Programmatic Post Editing

A major goal of the Mobiledoc kit is to allow complete customization of user
interfaces using the editing surface. The programmatic editing API allows
the creation of completely custom interfaces for buttons, hot-keys, and
other interactions.

To change the post in code, use the `editor.run` API. For example, the
following usage would mark currently selected text as "strong":

```js
editor.run(postEditor => {
  postEditor.toggleMarkup('strong')
})
```

It is important that you make changes to posts, sections, and markers through
the `run` and `postEditor` API. This API allows the Mobiledoc editor to conserve
and better understand changes being made to the post.

```js
editor.run(postEditor => {
  const mention = postEditor.builder.createAtom('mention', 'Jane Doe', { id: 42 })
  // insert at current cursor position:
  // or should the user have to grab the current position from the editor first?
  postEditor.insertMarkers(editor.range.head, [mention])
})
```

For more details on the API of `postEditor`, see the [API documentation](https://github.com/bustle/mobiledoc-kit/blob/master/src/js/editor/post.ts).

For more details on the API for the builder, required to create new sections
atoms, and markers, see the [builder API](https://github.com/bustle/mobiledoc-kit/blob/master/src/js/models/post-node-builder.ts).

### Configuring hot keys

The Mobiledoc editor allows the configuration of hot keys and text expansions.
For instance, the hot-key command-B to make selected text bold, is registered
internally as:

```js
const boldKeyCommand = {
  str: 'META+B',
  run(editor) {
    editor.run(postEditor => postEditor.toggleMarkup('strong'))
  },
}
editor.registerKeyCommand(boldKeyCommand)
```

All key commands must have `str` and `run` properties as shown above.

`str` describes the key combination to use and may be a single key, or modifier(s) and a key separated by `+`, e.g.: `META+K` (cmd-K), `META+SHIFT+K` (cmd-shift-K)

Modifiers can be any of `CTRL`, `META`, `SHIFT`, or `ALT`.

The key can be any of the alphanumeric characters on the keyboard, or one of the following special keys:

`BACKSPACE`, `TAB`, `ENTER`, `ESC`, `SPACE`, `PAGEUP`, `PAGEDOWN`, `END`, `HOME`, `LEFT`, `UP`, `RIGHT`, `DOWN`, `INS`, `DEL`

#### Overriding built-in keys

You can override built-in behavior by simply registering a hot key with the same name.
For example, to submit a form instead of entering a new line when `enter` is pressed you could do the following:

```js
const enterKeyCommand = {
  str: 'enter',
  run(editor) {
    // submit the form
  },
}
editor.registerKeyCommand(enterKeyCommand)
```

To fall-back to the default behavior, return `false` from `run`.

### Responding to text input

The editor exposes a hook `onTextInput` that can be used to programmatically react
to text that the user enters. Specify a handler object with `text` or `match`
properties and a `run` callback function, and the editor will invoke the callback
when the text before the cursor ends with `text` or matches `match`.
The callback is called after the matching text has been inserted. It is passed
the `editor` instance and an array of matches (either the result of `match.exec`
on the matching user-entered text, or an array containing only the `text`).

```js
editor.onTextInput({
  text: 'X',
  run(editor) {
    // This callback is called after user types 'X'
  },
})

editor.onTextInput({
  match: /\d\dX$/, // Note the "$" end anchor
  run(editor) {
    // This callback is called after user types number-number-X
  },
})
```

The editor has several default text input handlers that are defined in
`src/js/editor/text-input-handlers.js`.

To remove default text input handlers call the unregister function.

```js
editor.unregisterAllTextInputHandlers()
```

#### `\n` special-case match character

When writing a matching string it is common to use `\s` at the end of a match
regex, thus triggering the handler for a given string when the users presses
the space or tab key.

When the enter key is pressed no actual characters are added to a document.
Instead a new section is created following the current section. Despite this,
you may use `\n` in a match regex to capture moments when the enter key is
pressed. For example if you wanted to process a URL for auto-linking you
might want to process the string on both the space key and when the user hits
enter.

Since `\s` is a superset of `\n`, that makes the following regex a valid match
for a hand-typed URL after the user presses space or enter:

```regex
/\b(https?:\/\/[^\s]+)\s$/
```

### DOM Parsing hooks

A developer can override the default parsing behavior for leaf DOM nodes in
pasted HTML.

For example, when an `img` tag is pasted it may be appropriate to
fetch that image, upload it to an authoritative source, and create a specific
kind of image card with the new URL in its payload.

A demonstration of this:

```js
function imageToCardParser(node, builder, { addSection, addMarkerable, nodeFinished }) {
  if (node.nodeType !== 1 || node.tagName !== 'IMG') {
    return
  }
  const payload = { src: node.src }
  const cardSection = builder.createCardSection('my-image', payload)
  addSection(cardSection)
  nodeFinished()
}
const options = {
  parserPlugins: [imageToCardParser],
}
const editor = new Mobiledoc.Editor(options)
const element = document.querySelector('#editor')
editor.render(element)
```

Parser hooks are called with three arguments:

- `node` - The node of DOM being parsed. This may be a text node or an element.
- `builder` - The abstract model builder.
- `env` - An object containing three callbacks to modify the abstract
  - `addSection` - Close the current section and add a new one
  - `addMarkerable` - Add a markerable (marker or atom) to the current section
  - `nodeFinished` - Bypass all remaining parse steps for this node

Note that you _must_ call `nodeFinished` to stop a DOM node from being
parsed by the next plugin or the default parser.

### Tooltip Plugins

Developers can customize the appearance of tooltips (e.g. those shown when a user hovers over a link element) by specificying a tooltip plugin. A tooltip plugin is an object that implements the `renderLink` method.

The `renderLink` method is called with three arguments:

- `tooltip` - The DOM element of the tooltip UI.
- `link` - The DOM element (HTMLAnchorElement) of the link to display a tooltip for.
- `actions` - An object containing functions that can be called in response to user interaction.
  - `editLink` - A function that, when called, prompts the user to edit the `href` of the link element in question.

The `renderLink` method is responsible for populating the passed `tooltip` element with the correct content to display to the user based on the link in question. This allows Mobiledoc users to, for example, provide localized tooltip text via their system of choice.

```js
const MyTooltip = {
  renderLink(tooltip, link, { editLink }) {
    tooltip.innerHTML = `${i18n.translate('URL: ')} ${link.href}`
    const button = document.createElement('button')
    button.innerText = i18n.translate('Edit')
    button.addEventListener('click', editLink)
    tooltip.append(button)
  },
}
const editor = new Mobiledoc.Editor({
  tooltipPlugin: MyTooltip,
})
const element = document.querySelector('#editor')
editor.render(element)
```

## Contributing

Fork the repo, write a test, make a change, open a PR.

### Tests, Linting, Formatting

Install dependencies via yarn:

- [Node.js](http://nodejs.org/) is required
- Install [yarn](https://yarnpkg.com/en/docs/install) globally: `npm install -g yarn` or `brew install yarn`
- Install dependencies with yarn: `yarn install`

Run tests via the built-in broccoli server:

- `yarn start`
- `open http://localhost:4200/tests`

Or run headless tests via testem:

- `yarn test`

Tests in CI are run at Github Actions via Saucelabs (see the `test:ci` yarn script).

Run linter

- `yarn lint`

Run formatting

- `yarn format`

### Demo

To run the demo site locally:

- `yarn start`
- `open http://localhost:4200/demo/`

The assets for the demo are in `/demo`.

### Debugging

A debugging environment that prints useful information about the active Mobiledoc editor
can be access by:

- `yarn start`
- `open http://localhost:4200/demo/debug.html`

### Getting Help

If you notice a bug or have a feature request please [open an issue on github](https://github.com/bustle/mobiledoc-kit/issues).
If you have a question about usage you can post in the [slack channel](https://mobiledoc-kit.slack.com/) (automatic invites available from our [slackin app](https://mobiledoc-slack.herokuapp.com/)) or on StackOverflow using the [`mobiledoc-kit` tag](http://stackoverflow.com/questions/tagged/mobiledoc-kit).

### Releasing (Implementer notes)

- Use `np` (`yarn install -g np`)
- `np <version>` (e.g. `np 0.12.0`)
- `git push <origin> --tags`

### Deploy the website (demo & docs)

The demo website is hosted at
[bustle.github.io/mobiledoc-kit/demo](https://bustle.github.io/mobiledoc-kit/demo).

To publish a new version:

- `yarn run build:website` - This builds the website into `dist/website`
- `yarn run deploy:website` - Pushes the website to the `gh-pages` branch of the `origin` at github

_Development of Mobiledoc and the supporting libraries was generously funded by [BDG Media](https://www.bdg.com)._
