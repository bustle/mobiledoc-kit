# Renderers

All of the officially-supported mobiledoc renderers have the same signature and methods.
To instantiate a renderer, call its constructor with an object of options that has any of the following optional properties:

  * `atoms` [array] - The atoms that your mobiledoc includes and that the renderer will encounter
  * `cards` [array] - The cards that your mobiledoc includes and that the renderer will encounter
  * `cardOptions` [object] - Options to be passed to the card `render` (or `edit`) function and atoms `render` function
  * `unknownAtomHandler` [function] - This function is called (with the same arguments as `render`) whenever the renderer encounters an atom that doesn't
    match one of the `atoms` it has been provided
  * `unknownCardHandler` [function] - This function is called (with the same arguments as `render`) whenever the renderer encounters a card that doesn't
    match one of the `cards` it has been provided

An instance of a renderer has one method, `render`. This method accepts a mobiledoc and returns an object with two properties:
  * `result` [mixed] - The rendered result. Its type depends on the renderer, and can be a DOM Node (dom renderer) or a string (html or text renderers)
  * `teardown` [function] - Call this function to tear down the rendered mobiledoc. The dom renderer will remove the rendered dom from the screen. All renderers will call
    the card teardown callbacks that were registered using `env.onTeardown(callbackFunction)`

Example usage of a renderer:
```js
let renderer = new DOMRenderer({atoms: [atom1, atom2], cards: [card1, card2], cardOptions: {foo: 'bar'});
let rendered = renderer.render(mobiledoc);

document.body.appendChild(renderered.result);

// later...

rendered.teardown(); // removes the rendered items, calls teardown hooks
```
