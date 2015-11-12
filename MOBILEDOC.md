## Mobiledoc

Mobiledoc is a simple post or article format that aims to be:

* **Platform agnostic**. Should be possible to render without an HTML parser.
* **Efficient to transfer**. Compresses well, and limits the duplication of
  content.
* **Extensible at runtime**. Stores content, not layout or final display.

Mobiledoc is primarily intended to be used for news-related content such as
articles and blog posts. It is deliberately simple, and organizes its content
in an array of "sections" that are considered as individual blocks of content.

There is no concept of layout or design built into Mobiledoc. It is up to the
renderer to generate a display appropriate for its context. On mobile this may
mean each section is full-width and they are displayed sequentially. On larger
displays the sections may be rendered side-by-side. Mobiledoc makes no
prescription for output display.

## Usage

Often Mobiledoc will be used with one or more of:

* [Mobiledoc Kit](https://github.com/bustlelabs/mobiledoc-kit) to author an editor
  * [Ember Mobiledoc Editor](https://github.com/bustlelabs/ember-mobiledoc-editor) is one such editor 
* [Mobiledoc DOM Renderer](https://github.com/bustlelabs/mobiledoc-dom-renderer)
* [Mobiledoc HTML Renderer](https://github.com/bustlelabs/mobiledoc-html-renderer)
* [Mobiledoc Text Renderer](https://github.com/bustlelabs/mobiledoc-text-renderer)

## Specification

Mobiledoc consists of a wrapping object and nested array of section data. Using
arrays makes Mobiledocs each to render quickly.

The wrapper signature:

```
{
  version: "0.1",                         ──── Versioning information
  sections: [
    [                                     ──── List of markup types.
      markup,
      markup
    ],
    [                                     ──── List of sections.
      section,
      section,
      section
    ]
  ]
}
```

**Markup signature**

```
{
  version: "0.1",
  sections: [
    [tagName, optionalAttributes],        ──── Markup
    ['em'],                               ──── Example simple markup
    ['a', ['href', 'http://google.com']], ──── Example markup with attributes
  ],[
    // ...
  ]]
}
```

**Text Section**

```
{
  version: "0.1",
  sections: [[
    ["b"],                                ──── Markup at index 0
    ["i"]                                 ──── Markup at index 1
  ],[
    [typeIdentifier, tagName, markers],   ──── typeIdentifier for text sections
    [1, "h2", [                                is always 1.
      [[], 0, "Simple h2 example"],
    ]],
    [1, "p", [
      [openMarkupsIndexes, numberOfClosedMarkups, value],
      [[], 0, "Example with no markup"],
      [[0], 1, "Example wrapped in b tag"],
      [[1], 0, "Example opening i tag"],
      [[], 1, "Example closing i tag"],
      [[1, 0], 1, "Example opening i tag and b tag, closing b tag"],
      [[], 1, "Example closing b tag"]
    ]]
  ]]
}
```

The first item in the `sections` array is a list of markups. Markups have
a tagName, and optionally an array of `attributeName, attributeValue]` pairs.
The index in `openMarkupsIndex` specifies which markups should be opened at
the start of the `value` text. As these tags are opened, then create a stack
of opened markups. The `numberOfClosedMarkups` says how many markups should
be closed at the end of a `value`.

**Card Section**

```
{
  version: "0.1",
  sections: [[],[
    [typeIdentifier, tagName, markers],   ──── typeIdentifier for card sections
    [10, "card-name", cardPayload]             is always 10.
  ]]
}
```

`cardPayload` is arbitrary and should be passed through to the card
implementation.
