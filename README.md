# ContentKit-Editor [![Build Status](https://travis-ci.org/ContentKit/content-kit-editor.svg?branch=master)](https://travis-ci.org/ContentKit/content-kit-editor)

A modern, minimalist WYSIWYG editor.  (**[Demo](https://rawgit.com/ContentKit/content-kit-editor/master/demo/index.html)**)

![screenshot]
(https://rawgit.com/ContentKit/content-kit-editor/master/demo/screenshot.png)

*ContentKit-Editor is under active development*

---

## About ContentKit

ContentKit is a suite of tools used to create, parse, and render user generated content.  ContentKit's core centers around parsing content into its own simple JSON format. By storing a set of simple data, you are no longer bound to the originally generated HTML.  By separating the data from the presentation, you can render the same content in various different formats, layouts, and on various different platforms.

#### Use-case example:
You are developing a blogging platform.  You allow authors to create posts using a ContentKit's WYSIWYG editor.  ContentKit parses the post into its JSON format.  Readers then visit the blog on the web and ContentKit renders the post's JSON data back to HTML for display on the page.  Next, you decide to build mobile apps for your blogging platform.  ContentKit renders the content natively on iOS and Android.  Later, your power users want to use Markdown or HTML code to write their blogs posts.  ContentKit can parse it while also cleaning up tags you may not want to allow.  Later, you redesign the blog. Your original content is intact and is easily able to be rendered into your ambitious new layout. 

#### Current Tools:
- An HTML parser/renderer to transform content to and from JSON/HTML [(ContentKit-Compiler)](https://github.com/ContentKit/content-kit-compiler)
- A simple, modern WYSIWYG editor to generate content on the web [(ContentKit-Editor)](https://github.com/ContentKit/content-kit-editor)

#### Future Tools:
- A HTML renderer for Ruby, to pre-render HTML server-side
- An iOS renderer to display content natively using `UILabel`/`NSAttributedString` [(reference)](https://developer.apple.com/library/mac/documentation/cocoa/reference/foundation/classes/NSAttributedString_Class/Reference/Reference.html)
- An Android renderer for to display content natively using  `TextField`/`Spannable` [(reference)](http://developer.android.com/reference/android/text/Spannable.html)
- A Markdown parser/renderer to transform content to and from JSON/Markdown
