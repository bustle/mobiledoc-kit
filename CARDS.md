## Content-Kit / Mobiledoc Cards

Cards are an API supported by
[Content-Kit](https://github.com/bustlelabs/content-kit-editor),
the [Mobiledoc format](https://github.com/bustlelabs/content-kit-editor/blob/master/MOBILEDOC.md),
the [Mobiledoc DOM Renderer](https://github.com/bustlelabs/mobiledoc-dom-renderer)
and [Mobiledoc HTML Renderer](https://github.com/bustlelabs/mobiledoc-html-renderer).

A card is an object with a name and at least one of several hooks defined. For example:

```js
var demoCard = {
  name: 'demo',
  display: {
    setup(element) {
      element.innerHTML = 'display demo content';
    }
  }
};
```

In this minimally viable demo, a `display` hook is defined showing some text.
Given a Mobiledoc referencing `demo` as a card this text would render for that
name.

Cards are executed at runtime by Content-Kit and the renderers. This means
you must pass any cards you want available to an editor or renderer. See the
documentation for each project on how to do this.

### Available hooks

Between [Content-Kit](https://github.com/bustlelabs/content-kit-editor),
the [Mobiledoc DOM Renderer](https://github.com/bustlelabs/mobiledoc-dom-renderer)
and [Mobiledoc HTML Renderer](https://github.com/bustlelabs/mobiledoc-html-renderer)
there are several hooks a complete card should define.

|Hook|Used by Content-Kit|Used by DOM Renderer|Used by HTML Renderer|
|---|---|---|---|
|`display`|✓|✓||
|`edit`|✓|||
|`html`|||✓|

Each hook has a `setup` and `teardown` method. The arguments are:

```js
var exampleCard = {
  name: 'example',
  display: {
    setup(element, options, env, payload) {},
    teardown(setupReturnValue) {}
  },
  edit: {
    setup(element, options, env, payload) {},
    teardown(setupReturnValue) {}
  },
  html: {
    setup(buffer, options, env, payload) {},
    teardown(setupReturnValue) {}
  }
};
```

* `element` is a DOM element for that section. Nodes of that view for a card
  should be appended to the `element`.
* `buffer` is an array passed to the `html` hook instead of a DOM element.
  The content for the card should be pushed on that array as a string.
* `options` is the `cardOptions` argument passed to the editor or renderer.
* `env` contains information about the running of this hook. It may contain
  the following functions:
  * `env.save(payload)` will save a new payload for a card instance, then
    swap a card in edit mode to display.
  * `env.cancel()` will swap a card in edit mode to display without changing
    the payload.
  * `env.edit()` is available to the `display` setup, and when called swaps
    the instance to edit mode.
  * `env.remove()` remove this card. This calls the current mode's `teardown()`
    hook and removes the card from DOM and from the post abstract.
    the instance to edit mode.
* `payload` is the payload for this card instance. It was either loaded from
  a Mobiledoc or generated and passed into an `env.save` call.

Additionally, *renderers may offer the ability to configure a non-standard
hook name at runtime*. An example would be having the DOM renderer called with
an option specifying the hook name `mobile-placeholder`. This allows for
variants of a card in different situations.

### Card Lifecycle

Cards rendered by Content-Kit may move between `edit` and `display` hooks
many times after being added (or loaded from a Mobiledoc). The can do this
by calling the functions passed to `env`.

The `env.save` function accepts the argument of a payload, which is passed to
later setup calls. A minimal editable component would look like:

```js
var displayTextCard = {
  name: 'display-text',
  display: {
    setup(element, options, env, payload) {
      $('<div>').text(payload.text).appendTo(element);
      if (env.edit) {
        $('<button>Edit</button>').appendTo(element).on('click', env.edit);
      }
      $('<button>Remove</button>').appendTo(element).on('click', env.remove);
    }
  },
  edit: {
    setup(element, options, env, payload) {
      $('<div>Edit this card:</div>').appendTo(element);
      let input = $('<input>');
      if (payload.text) {
        input.val(payload.text);
      }
      $('<button>Save</button>').appendTo(element).on('click', function() {
        env.save(input.val());
      });
      $('<button>Cancel</button>').appendTo(element).on('click', env.cancel);
    }
  }
};
```

Additionally, if anything is returned from `setup` that result will be passed
to `teardown` as the only argument. This allows you to pass a reference to
any objects you may have created during `setup` for destruction.
