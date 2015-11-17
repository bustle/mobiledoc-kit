# Card Unification

  * [ ] Change card shape to object with `type`, `name`, `render` and optional `edit` properties
  * [ ] Card's `type` is validated by renderer (dom renderer cannot render 'text', e.g.)
  * [ ] Change arguments passed by editor to card's `render` (or `edit`) method
    * [ ] single argument object with `name`, `buffer`, `isInEditor`, `options`, `editorEnv` and `payload` properties
  * [ ] Return value of card's `render` (or `edit`) method is appended/concatenated by renderer
  * [ ] card can register teardown callback by calling `buffer.onTeardown(teardownFn)`
  * [ ] Change editor-dom renderer to clear child elements from card element on teardown
  * [ ] Renderer `constructor` signature changes to accept cards (array), cardOptions (object) arguments
  * [ ] Renderer `render` instance method accepts `mobiledoc` argument, returns `rendered` object with 2 props:
    * [ ] `result` property (which is a dom node or string, depending)
    * [ ] `teardown` method with no args tears down rendered mobiledoc (removing dom when applicable, calling registered card teardown callbacks when applicable)

## Projects that must change

 * [ ] [mobiledoc-html-renderer](https://github.com/bustlelabs/mobiledoc-html-renderer)
 * [ ] [mobiledoc-dom-renderer](https://github.com/bustlelabs/mobiledoc-dom-renderer)
 * [ ] [mobiledoc-text-renderer](https://github.com/bustlelabs/mobiledoc-text-renderer)
 * [ ] editor-dom renderer within [mobiledoc-kit](https://github.com/bustlelabs/mobiledoc-kit)
 * [ ] [ember-mobiledoc-editor](https://github.com/bustlelabs/ember-mobiledoc-editor)
 * [ ] demo app within mobiledoc-kit

## Card shape

Every card is an object that *must* define the following properties:
 * `render`: A function called by the renderer to display the card
 * `type`: A string. The render context (currently the only known render contexts are 'dom', 'html' and 'text')
 * `name`: A string. This is the same string that is in DOM

Additionally a card *may* define the following property:

 * `edit`: A function that the editor-dom renderer calls to render the card in edit state. Non-editor renderers will likely have no reason to have an edit property

## Card `render` method

The `render` method (and the `edit` method if applicable) receives a single argument that is an object with the following properties:

  * `name`
  * `buffer` An object supplied by the renderer that provides an `onTeardown` method to register a teardown callback
  * `options` The card options passed to the renderer
  * `isInEditor` True when being rendered in an editor, false otherwise
  * `editorEnv`
    * editorEnv will be an object populated, when being rendered by an editor, with the following properties:
    * `save` Method with the signature `(newPayload, transition=false)`. Replaces payload with `newPayload` and transitions to display mode if `transition` is true
    * `cancel` Method with no args. Exit edit mode without saving payload
    * `edit` Method with no args. Change from display mode to edit mode
    * `remove` Method with no args. Remove this card from the post abstract
    * `section` The post abstract cardSection for this card (can be used with the `postEditor` to manipulate this card in other ways)
  * `payload` The payload in the mobiledoc for this card

### Rendering a card

The **return value** of the `render` method is the rendered result of the card. This should either be a dom node (for cards with type 'dom') or a string (for cards with type 'html' or 'text'). Renderers should validate that the return value is the correct type.

### Tearing down a card

The 80% use case is likely that most cards will not need to clean up after themselves. The editor-dom renderer will clear child nodes, which should account for most use cases.
When cards need to manage their own cleanup, however, they can register a teardown callback by calling the `onTeardown` method on the `buffer` with a function to be called on teardown, e.g.:

```
buffer.onTeardown(() => doTeardownStuff());
```

### Renderer

### Change Renderer `constructor` signature

The renderer constructor will change to accept `cards` (array) and `cardOptions` (object):
```
let render = new Renderer(cards=[], cardOptions={});
```

### Change Renderer `render` signature and return value

The `render` method will accept a `mobiledoc` and return an object with `result` property and `teardown` method:

```javascript
let rendered = render(mobiledoc);
// renderered.result === DOM node or string, depending on the renderer

rendered.teardown() // calls teardown hooks for any rendered cards, removes the rendered.result if it is attached
```

### Renderer instance is reusable, `render` is reentrant (stateless)

Ensure that `render` is stateless for the dom, html and text renderers (this is already the case for the dom and html renderers).

An instance of a renderer should be reusable for rendering multiple mobiledocs (this simplifies "inception" cards that also render mobiledoc), which means its `render` method must also be stateless.

