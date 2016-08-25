# Mobiledoc Atoms

Atoms are effectively read-only inline cards.

## Atom format

An atom is a JavaScript object with 3 *required* properties:

  * `name` [string] - The name of this atom in the mobiledoc
  * `type` [string] - The output of this atom. Valid values are 'dom', 'html', and 'text'
  * `render` [function] - Invoked by the renderer to render this atom

## Atom rendering

The `render` function on an atom is called by an instance of a renderer and passed an object with the following four properties:

  * `env` [object] - A set of environment-specific properties
  * `options` [object] - Rendering options that were passed to the renderer (as `atomOptions`) when it was instantiated
  * `payload` [object] - The data payload for this atom from the mobiledoc
  * `value` [string] - The textual representation to for this atom

The return value of the `render` function will be inserted by the renderer into the rendered mobiledoc.
The return value can be null if an atom does not have any output. If there is a return value it
must be of the correct type (a DOM Node for the dom renderer, a string of html or text for the html or text renderers, respectively).

#### `env`

`env` always has the following properties:

  * `name` [string] - the name of the atom
  * `onTeardown` [function] - The atom can pass a callback function: `onTeardown(callbackFn)`. The callback will be called when the rendered content is torn down.
  * `save` [function] - Call this function with the arguments `(newValue, newPayload)` to update the atom's value and payload and rerender it.

## Atom Examples

Example dom atom that renders a mention:

```js
export default {
  name: 'mention',
  type: 'dom',
  render({ env, options, value, payload}) {
    return document.createTextNode(`@${value}`);
  }
};
```

Example dom atom that registers a teardown callback:
```js
let atom = {
 name: 'atom-with-teardown-callback',
 type: 'dom',
 render({env, options, value, payload}) {
   env.onTeardown(() => {
    console.log('tearing down atom named: ' + env.name);
   });
 }
};
```

Example dom atom that uses the `save` hook:
```js
let atom = {
 name: 'click-counter',
 type: 'dom',
 render({env, value, payload}) {
   let clicks = payload.clicks || 0;
   let button = document.createElement('button');
   button.appendChild(document.createTextNode('Clicks: ' + clicks));

   button.onclick = () => {
     payload.clicks = clicks + 1;
     env.save(value, payload); // updates payload.clicks, rerenders button
   };

   return button;
 }
};
```
