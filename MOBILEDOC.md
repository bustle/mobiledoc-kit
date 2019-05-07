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

* [Mobiledoc Kit](https://github.com/bustle/mobiledoc-kit) to author an editor
  * [Ember Mobiledoc Editor](https://github.com/bustle/ember-mobiledoc-editor) is one such editor
* [Mobiledoc DOM Renderer](https://github.com/bustle/mobiledoc-dom-renderer)
* [Mobiledoc HTML Renderer](https://github.com/bustle/mobiledoc-html-renderer)
* [Mobiledoc Text Renderer](https://github.com/bustle/mobiledoc-text-renderer)

## Specification

Mobiledoc consists of a wrapping object, type definitions for markup, atoms and cards,
and an array of section data. Markup, atoms and cards are referenced (one or more times) from within section data by array index. Using arrays makes Mobiledocs each to render quickly.

The wrapper signature:

```
{
  version: "0.3.2",                         ──── Versioning information
  markups: [                              ──── Ordered list of markup types
    markup,
    markup
  ],
  atoms: [                                ──── Ordered list of atom types
    atom,
    atom
  ],
  cards: [                                ──── Ordered list of card types
    card,
    card
  ],
  sections: [                             ──── Ordered list of sections.
    section,
    section,
    section
  ]
}
```

### Signatures

**Markup definition signature**

Markups have a tagName and an optional array of attributes. Not all markups can have attributes, but for those that do the attributes array is a *single* array of all the attribute names and values, one after another. E.g., `["a", ["href", "http://bustle.com", "target", "_blank"]`.

```
{
  version: "0.3.2",
  markups: [
    [tagName, optionalAttributesArray],   ──── Markup
    ["em"],                               ──── Example simple markup with no attributes
    ["a", ["href", "http://google.com", "target", "_blank"]], ──── Example markup with 2 attributes ("href" and "target")
  ]
}
```

**Atom definition signature**

Atoms have a name, text value and arbitrary payload.

```
{
  version: "0.3.2",
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
  version: "0.3.2",
  cards: [
    [cardName, cardPayload],            ──── Card
    ['image', {                         ──── Example 'image' card
      'src': 'http://google.com/logo.png'
    }]
  ]
}
```

**Section definition signature**

Sections have an identifier and other values depending on their type. See _Sections_.

```
{
  version: "0.3.2",
  sections: [
    [sectionTypeIdentifier, <type dependent>], ──── Card
    [1, "h2", [                        ──── Example 'heading 2 text' section
      [0, [], 0, "Simple h2 example"],
    ]]
}
```

**Marker definition signature**

The text of a document is held in markers which signal where markup and atoms apply. Markers are used in text and list sections.

```
{
  version: "0.3.2",
  markups: [
    ["b"],                                ──── Markup at index 0
    ["i"]                                 ──── Markup at index 1
  ],
  atoms: [
    ["mention", "@bob", { id: 42 }]       ──── mention Atom at index 0
    ["mention", "@tom", { id: 12 }]       ──── mention Atom at index 1
  ]
  sections: [
    [1, "p", [
      [textTypeIdentifier, openMarkupsIndexes, numberOfClosedMarkups, value],
      [0, [], 0, "Example with no markup"],      ──── textTypeIdentifier for markup is always 0
      [0, [0], 1, "Example wrapped in b tag (opened markup #0), 1 closed markup"],
      [0, [1], 0, "Example opening i tag (opened markup with #1, 0 closed markups)"],
      [0, [], 1, "Example closing i tag (no opened markups, 1 closed markup)"],
      [0, [1, 0], 1, "Example opening i tag and b tag, closing b tag (opened markups #1 and #0, 1 closed markup [closes markup #0])"],
      [0, [], 1, "Example closing i tag, (no opened markups, 1 closed markup [closes markup #1])"],
    ]],
    [1, "p", [
      [textTypeIdentifier, openMarkupsIndexes, numberOfClosedMarkups, atomIndex],
      [1, [], 0, 0],             ──── mention atom at index 0 (@bob), textTypeIdentifier for atom is always 1
      [1, [0], 1, 1]             ──── mention atom at index 1 (@tom) wrapped in b tag (markup index 0)
    ]]
  ]
}
```

## Markers

Opening and closing of markups are tracked by markers. They are expected to be balanced for a valid document. Opening markups are specificed by referencing the markups array in the document by index. Markups are closed in the order they are opened, in the quantity specified in the marker.

```
[textTypeIdentifier, openMarkupsIndexes, numberOfClosedMarkups, atomIndex],
```

The index in `openMarkupsIndex` specifies which markups should be opened at the start of the `value` text. As these tags are opened, then create a stack of opened markups. `value` has the open markups from all previous markers (that are unclosed) and its own marker applied. The `numberOfClosedMarkups` says how many of those opened markup tags should be closed at the end of a `value`. Markups closed in this marker will not be applied to the next marker value.

There are two types of markers, identified with the following numbers:

* `0` - Text
* `1` - Atom

**Text marker**

`value` is plain text

**Atom marker**

`value` is an index reference to the atoms array in the document. How markups are applied to atoms is left to the renderer. If an atom is present in Mobiledoc but no atom implementation is registered, the text value of the atom will be rendered as plain text as a fallback.

## Markup

General text decorations are given by markup. A markup definition array's first item (the markup `tagName`) must be one of:

* `a` - Hypertext link
* `b` - Bold
* `code` - Code
* `em` - Emphasis
* `i` - Italic
* `s` - Strike-through
* `strong` - Strong
* `sub` - Subscript
* `sup` - Superscript
* `u` - Underline

Attributes are specified in pairs in an array after the markup name. Where a markup is used with different attributes, that markup will have to be in the markup list for each unique set of attributes.

**Hypertext link**

An `href` attribute is expected with this markup.

## Sections

There are four section types. Each section has a different signature dependent on it's type. Sections are identified with the following numbers:

* `1` - Markup (Text)
* `2` - Image
* `3` - List
* `10` - Card

_Section identifiers 4 through 9 are reserved for future use_

**Markup Section**

Markup sections, in addition to plain text, can include markups and atoms.

```
{
  version: "0.3.2",
  markups: [
    ["b"],                           ──── Markup at index 0
    ["i"]                            ──── Markup at index 1
  ],
  atoms: [
    ["mention", "@bob", { id: 42 }]  ──── mention Atom at index 0
    ["mention", "@tom", { id: 12 }]  ──── mention Atom at index 1
  ]
  sections: [
    [
      sectionTypeIdentifier,         ──── sectionTypeIdentifier for markup
      tagName,                            sections is always 1
      markers,
      optionalSectionAttributesArray
    ],
    [1, "h2", [
      [0, [], 0, "Simple h2 example"],
    ]],
    [1, "p", [
      [0, [], 0, "Simple aligned example"],
    ], ["data-md-text-align", "center"]],
    [1, "p", [
      [
        textTypeIdentifier,
        openMarkupsIndexes,
        numberOfClosedMarkups,
        value
      ],
      [
        0,                           ──── textTypeIdentifier for markup is always 0
        [],
        0,
        "Example with no markup"
      ],
      [0, [0], 1, "Example wrapped in b tag (opened markup #0), 1 closed markup"],
      [0, [1], 0, "Example opening i tag (opened markup with #1, 0 closed markups)"],
      [0, [], 1, "Example closing i tag (no opened markups, 1 closed markup)"],
      [0, [1, 0], 1, "Example opening i tag and b tag, closing b tag (opened markups #1 and #0, 1 closed markup [closes markup #0])"],
      [0, [], 1, "Example closing i tag, (no opened markups, 1 closed markup [closes markup #1])"],
    ]],
    [1, "p", [
      [textTypeIdentifier, openMarkupsIndexes, numberOfClosedMarkups, atomIndex],
      [
        1,                           ──── mention atom at index 0 (@bob),
        [],                               textTypeIdentifier for atom is always 1
        0,
        0
      ],
      [1, [0], 1, 1]                 ──── mention atom at index 1 (@tom) wrapped
    ]],                                   in b tag (markup index 0)
  ]
}
```

A section `tagName` must be one of:

* `aside`
* `blockquote`
* `h1` - Heading 1
* `h2`
* `h3`
* `h4`
* `h5`
* `h6`
* `p` - Paragraph

A section `optionalSectionAttributesArray` is an array of key/value pairs.
Valid keys include:

* `data-md-text-align` - Alignment of text in a section. With values matching
  those of
  [CSS's `text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align).

**Image section**

Renders an image. In many scenarios, a card to suit your needs is better.

```
{
  version: "0.3.2",
  sections: [
    [sectionTypeIdentifier, src],
    [2, "http://placekitten.com/200/100"]
  ]
}
```

**List section**

Lists are similar to markup sections but have a set of markers for each list item.

```
{
  version: "0.3.2",
  markups: [
    ["b"]                                ──── Markup at index 0
  ],
  atoms: [
    ["mention", "@bob", { id: 42 }]       ──── mention Atom at index 0
  ]
  sections: [
    [
      sectionTypeIdentifier,
      tagName,
      [markers, markers, markers],
      optionalSectionAttributesArray
    ],
    [3, "ol", [
      [
        [0, [], 0, "Plain"]
      ],
      [
        [0, [0], 1, "Bold"]
      ],
      [
        [1, [], 0, 0]                  ──── mention atom at index 0 (@bob)
      ],
    ]],
  ]
}
```

A section `tagName` must be one of:

* `ul` - Unordered list
* `ol` - Ordered list

A section `optionalSectionAttributesArray` is an array of key/value pairs.
Valid keys include:

* `data-md-text-align` - Alignment of text in a section. With values matching
  those of
  [CSS's `text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align).

**Card Section**

```
{
  version: "0.3.2",
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
