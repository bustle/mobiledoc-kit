# Mobiledoc Cards

Cards are an API supported by
[Mobiledoc Kit](https://github.com/bustle/mobiledoc-kit),
the [Mobiledoc format](https://github.com/bustle/mobiledoc-kit/blob/master/MOBILEDOC.md),
the [Mobiledoc DOM Renderer](https://github.com/bustle/mobiledoc-dom-renderer),
the [Mobiledoc HTML Renderer](https://github.com/bustle/mobiledoc-html-renderer),
and the [Mobiledoc Text Renderer](https://github.com/bustle/mobiledoc-text-renderer).


## Card format

A card is a javascript object with 3 *required* properties:

  * `name` [string] - The name of this card in the mobiledoc
  * `type` [string] - The output of this card. Valid values are 'dom', 'html', and 'text'
  * `render` [function] - Invoked by the renderer to render this card

And one optional property, if this card will be used by an editor:

  * `edit` [function] - Has the same signature as `render`, and can be invoked when the card
    is being rendered by an editor (as opposed to rendered for display) to switch between "display"
    and "edit" modes for a card in the editor.

## Card rendering

The `render` and (when present) `edit` functions on a card have the same signature. They
are called by an instance of a renderer and passed an object with the following three properties:

  * `env` [object] - A set of environment-specific properties
  * `options` [object] - Rendering options that were passed to the renderer (as `cardOptions`) when it was instantiated
  * `payload` [object] - The data payload for this card from the mobiledoc

The return value of the `render` (and `edit`) functions will be inserted by the renderer into the rendered mobiledoc.
The return value can be null if a card does not have any output. If there is a return value it
must be of the correct type (a DOM Node for the dom renderer, a string of html or text for the html or text renderers, respectively).

#### `env`

`env` always has the following properties:

  * `isInEditor` [boolean] - true when the card is being rendered by an editor (not being rendered for display)
  * `name` [string] - the name of the card
  * `onTeardown` [function] - The card can pass a callback function: `onTeardown(callbackFn)`. The callback will be called when the rendered content is torn down.
  * `didRender` [function] - The card can pass a callback function: `didRender(callbackFn)`. The callback will be called when the card is rendered (on initial render and also after transitioning between display/edit states). This callback can be used to do additional work that must happen after the card's element has been appended to the DOM.

When being rendered by an editor (i.e., `env.isInEditor` is true), the env will have the following additional properties:

  * `edit` [function] - This function can be called to switch the card to "edit" mode. It is a no-op if the card is already in edit mode
  * `save` [function] - Used to save a new payload for a card. Typically called when the card is in "edit" mode to update the payload and transition
                    back to "display" mode. The function signature is `save(newPayload, transition=true)`. When `transition` is false the payload is
                    updated but the card is not switched to display mode
  * `cancel` [function] - Called to transition from "edit" to "display" mode without changing the payload. It is a no-op if the card is in display mode already
  * `remove` [function] - Removes this card from the document
  * `postModel` [object] - The instance of this card's section in the editor's internal abstract tree. This can be used along with the mobiledoc-kit `postEditor` API to transform the card in other ways (for example, moving the card to a different section of the document)

## Card examples

Example dom card that renders an image:
```js
let card = {
 name: 'simple-image',
 type: 'dom',
 render({env, options, payload}) {
   let src = payload.src || 'http://placekitten.com/100x100';
   let img = document.createElement('img');
   img.src = src;
   return img;
 }
};
```

Example dom card that registers a teardown callback:
```js
let card = {
 name: 'card-with-teardown-callback',
 type: 'dom',
 render({env, options, payload}) {
   env.onTeardown(() => {
    console.log('tearing down card named: ' + env.name);
   });
 }
};
```
