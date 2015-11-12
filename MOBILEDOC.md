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

Mobiledoc consists of a wrapping object, type definitions for markup, atoms and cards,
and an array of section data. Using arrays makes Mobiledocs each to render quickly.

The wrapper signature:

```
{
  version: "0.3",                         ──── Versioning information
  markups: [                              ──── List of markup types
    markup,
    markup
  ],
  atoms: [                                ──── List of atom types
    atom,
    atom
  ],
  cards: [                                ──── List of card types
    card,
    card
  ],
  sections: [                             ──── List of sections.
    section,
    section,
    section
  ]
}
```

**Markup definition signature**

Markups have a tagName, and optionally an array of `attributeName, attributeValue]` pairs

```
{
  version: "0.3",
  markups: [
    [tagName, optionalAttributes],        ──── Markup
    ['em'],                               ──── Example simple markup
    ['a', ['href', 'http://google.com']], ──── Example markup with attributes
  ]
}
```

**Atom definition signature**

Atoms have a name, text value and arbitrary payload.

```
{
  version: "0.3",
  atoms: [
    [atomName, atomText, atomPayload],    ──── Atom
    ['mention', '@bob', { id: 42 }]       ──── Example 'mention' atom
  ]
}
```

**Card definition signature**

Cards have a name and arbitrary payload.

```
{
  version: "0.3",
  cards: [
    [cardName, cardPayload],            ──── Card
    ['image', {                         ──── Example 'image' card
      src: 'http://google.com/logo.png'
    }]
  ]
}
```

**Markup Section**

Markup sections, in addition to plain text, can include markups and atoms.

```
{
  version: "0.3",
  markups: [
    ["b"],                                ──── Markup at index 0
    ["i"]                                 ──── Markup at index 1
  ],
  atoms: [
    ["mention", "@bob", { id: 42 }]       ──── mention Atom at index 0
    ["mention", "@tom", { id: 12 }]       ──── mention Atom at index 1
  ]
  sections: [
    [sectionTypeIdentifier, tagName, markers],   ──── sectionTypeIdentifier for markup sections
    [1, "h2", [                                       is always 1.
      [0, [], 0, "Simple h2 example"],
    ]],
    [1, "p", [
      [textTypeIdentifier, openMarkupsIndexes, numberOfClosedMarkups, value],
      [0, [], 0, "Example with no markup"],      ──── textTypeIdentifier for markup is always 0
      [0, [0], 1, "Example wrapped in b tag"],
      [0, [1], 0, "Example opening i tag"],
      [0, [], 1, "Example closing i tag"],
      [0, [1, 0], 1, "Example opening i tag and b tag, closing b tag"],
      [0, [], 1, "Example closing b tag"],
    ]],
    [1, "p", [
      [textTypeIdentifier, atomIndex, openMarkupsIndexes, numberOfClosedMarkups],
      [1, 0, [], 0],                                    ──── mention atom at index 0 (@bob), textTypeIdentifier for atom is always 1
      [1, 1, [0], 1]                                    ──── mention atom at index 1 (@tom) wrapped in b tag
    ]],
  ]
}
```

The index in `openMarkupsIndex` specifies which markups should be opened at
the start of the `value` text. As these tags are opened, then create a stack
of opened markups. The `numberOfClosedMarkups` says how many markups should
be closed at the end of a `value`.

In addition to markups, markup sections may contain [ATOMS](ATOMS.md).
Atoms have a `textTypeIdentifier` of 1 and contain a `atomTypeIndex`, text content
and an `atomPayload` object which is arbitrary and passed through to the atom's
implementation.

Atoms also have `openMarkupsIndex` and `numberOfClosedMarkups` so that markup can flow
across them.

If an atom is present in Mobiledoc, but no atom implementation is registered, then the text
value of the atom will be rendered as plain text as a fallback.

**Card Section**

```
{
  version: "0.3",
  cards: [
    ["card-name", { cardPayload }]
  ],
  sections: [
    [typeIdentifier, cardIndex],                 ──── typeIdentifier for card sections
    [10, 0]                                           is always 10.
  ]
}
```

`cardPayload` is arbitrary and should be passed through to the card
implementation.
