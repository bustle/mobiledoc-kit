# mobiledoc format

mobiledoc is the output format that content-kit-editor produces.
It aims to be a terse format that is efficiently transferred over the wire
for a client (be it web or native) to render.

## goals for mobiledoc

### efficient to transfer

The mobiledoc format is intended to be simple and fairly terse so that it compresses as well or better than HTML.

### platform-agnostic

mobiledoc is intended to be largely platform-agnostic. Sample use cases:

  * A web app downloads an article in mobiledoc format via ajax and uses the mobiledoc-dom-renderer to render and display it
  * An Ember app is running server-side via fastboot and needs to generate HTML server-side for SEO purposes. It uses the mobiledoc-html-renderer to turn a mobiledoc article that it retrieves from the API into an HTML string
  * A native iOS app downloads an article in mobiledoc format and uses a custom renderer to generate a native view to display the article

In all the above cases, the input is the same: An article in mobiledoc format, provided via an api.

### content-focused

mobiledoc is primarily intended to be used for news-related content such as articles and blog posts. It is deliberately simple, and organizes its content in an array of "sections" that are considered as individual blocks of content.

There is not currently any concept of layout or design built into the format. It is up to the renderer to generate a display appropriate for its context. On mobile this may mean each section is full-width and they are displayed sequentially. On larger displays the sections may be rendered side-by-side. mobiledoc makes no prescription for output display.

### extensible

mobiledoc should be open for extension with custom types (called "cards") that bring their own configuration, and possibly their own renderers. Primary renderers (the dom, html, native, etc renderers) should be able to gracefully handle cards that they cannot natively render.

## format specification

mobiledoc format is an array with two elements: `markerTypes` and `sections`. The marker types describe all of the possible `markups` that may be applied to `markers` within the sectionssection.

#### markupTypes

A `markupType` is an array of 1 or 2 items: `[markerTypes, sections]`. The first item in the array is the type of markup, typically a tagName (such as `"B"`). The markupType can optionally have a second item in its array, which is an array of `attributes` to be applied to it. The attributes are listed as `propName`, `propValue` in the array. Each `nth` item in the array is a propName and each `(n+1)th` item in the array is that propName's propValue.

Example markupTypes:

  * Bold tag: `["B"]`
  * Anchor tag linking to this repository: `["A", ["href", "http://github.com/bustlelabs/content-kit-editor"]]`
  * Anchor tag linking to this repository and with `target="_blank"`: `["A", ["href", "http://github.com/bustlelabs/content-kit-editor", "target", "_blank"]]`

#### sections

A section is an array of three items: `[sectionType, tagName, markers]`. `sectionType` defines the type of block section that this is. The only supported type now is `1`. `tagName` is the name of the block tag to use. H1-H6 and P are possible values. `markers` is an array of the content within that section, separated by the markup that is to be applied to it.

#### markers in sections

A marker is an array of three items: `[openingMarkupTypes, closingMarkupCount, value]`. `openingMarkupTypes` is an array of the indexes of the `markupTypes` to apply to this marker, `closingMarkupCount` is how many markup types are closing at the end of this marker, and `value` is the text value inside the marker.

Assuming these `markerTypes`:
```
markerTypes = [
  ["B"],  // index 0
  ["I"],  // index 1
  ["A", ["href", "google.com"]],  // index 2
]
```

And this section:

```
section = [
  1,   // type of section
  "P", // tagName of section
  [    // markers
    [
      [1],  // open marker type of index 1 (italics)
      0,    // close 0 open markers
      'italicized'  // the text value
    ],
    [
      [0],  // open marker type of index 0 (bold)
      1,    // close 1 markerType (the most-recently opened marker type (bold) will be closed)
      'bold + italicized'
    ],
    [
      [],  // open no marker types
      1,   // close 1 marker type (in this case, italics)
      'only italicized'
    ],
    [
      [2],  // start the A tag
      1,    // and close it after this text
      'I am a link'
    ]
  ]
]
```
