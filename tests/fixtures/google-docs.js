export default {
  'simple paragraph as span': {
    expected: "<p>simple paragraph</p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c07-deca-96cb-4b79c9ad7a7f"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">simple paragraph</span></b>`
  },
  'simple paragraph as span (Chrome - Windows)': {
    expected: "<p>simple paragraph</p>",
    raw: `<html><body><!--StartFragment--><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-af1f8f2c-cacc-6998-07a1-89da38d9c501"><span style="font-size:14.666666666666666px;font-family:Arial;color:#222222;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">simple paragraph</span></b><!--EndFragment--></body></html>`
  },

  // when selecting a line without including the end of the line, the html represention
  // includes a <span> or series of <span>s
  'paragraph with bold as span': {
    expected: "<p>paragraph with <strong>bold</strong></p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c09-8dc9-fb2f-f7eb880e143d"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">paragraph with </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span></b>`
  },
  'paragraph with bold as span (Chrome - Windows)': {
    expected: "<p>paragraph with <strong>bold</strong></p>",
    raw: `<html><body><!--StartFragment--><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-af1f8f2c-cacd-c884-b763-ee9510747969"><span style="font-size:14.666666666666666px;font-family:Arial;color:#222222;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">paragraph with </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#222222;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span></b><!--EndFragment--></body></html>`
  },

  // when selecting a line that includes the end (using, e.g., shift+up to selection the entire line),
  // the html representation includes a <p> tag
  'paragraph with bold as p': {
    expected: "<p>A <strong>bold</strong> paragraph.<p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-9031-bb09-1958-dcc3dd34c237"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">A </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> paragraph.</span></p></b><br class="Apple-interchange-newline">`
  },
  'paragraph with italic as span': {
    expected: "<p>paragraph with <em>italic</em></p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c15-20cb-c8cd-59f592dc8402"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">paragraph with </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">italic</span></b>`
  },
  'paragraph with bold + italic as p': {
    expected: "<p>And a second <strong>bold</strong> <em>italic</em> paragraph.",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-9038-f59a-421c-1c5303efdaf6"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">And a second </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">italic</span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> paragraph.</span></p></b><br class="Apple-interchange-newline">`
  },
  '2 paragraphs as p': {
    expected: "<p>Paragraph 1</p><p>Paragraph 2</p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c66-10b0-1c99-0210f64abe05"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Paragraph 1</span></p><br><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Paragraph 2</span></b>`
  },
  'h1 with h1 tag': {
    expected: "<h1>h1 text</h1>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-2f095724-903a-1280-b377-a2b08d38ffaa"><h1 dir="ltr" style="line-height:1.38;margin-top:20pt;margin-bottom:6pt;"><span style="font-size:26.666666666666664px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">h1 text</span></h1></b>`
  },
  'paragraph with link as span': {
    expected: "<p>link to <a href='http://bustle.com'>bustle</a></p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-903c-08a3-cc9c-7841d9aa3871"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">link to </span><a href="http://bustle.com" style="text-decoration:none;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">bustle</span></a></b>`
  },
  'paragraph with link as p': {
    expected: "<p>link to <a href='http://bustle.com'>bustle</a></p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-903b-12a4-6455-23c68a9eae95"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">link to </span><a href="http://bustle.com" style="text-decoration:none;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">bustle</span></a></p></b><br class="Apple-interchange-newline">`
  },
  'img in span': {
    expected: "<p><img src='https://placehold.it/100x100'></p>",
    raw: `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-7a3c9f90-a5c3-d3b6-425c-75b28c50bd7e"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"><img src="https://placehold.it/100x100" width="500px;" height="374px;" style="border: none; transform: rotate(0.00rad); -webkit-transform: rotate(0.00rad);"/></span></b>`
  }
};
