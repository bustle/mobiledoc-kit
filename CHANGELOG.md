<a name="0.11.2-ghost.4"></a>
## <small>0.11.2-ghost.4 (2019-06-03)</small>

* 🐛 Fixed range#expandByMarker not expanding to beginning/end of section (#677) ([0000d1d](https://github.com/bustle/mobiledoc-kit/commit/0000d1d)), closes [#677](https://github.com/bustle/mobiledoc-kit/issues/677)
* Copy update in demo ([77de471](https://github.com/bustle/mobiledoc-kit/commit/77de471))
* Fix sectionParser obliterating plain text content in certain circumstances (#685) ([e5f877f](https://github.com/bustle/mobiledoc-kit/commit/e5f877f)), closes [#685](https://github.com/bustle/mobiledoc-kit/issues/685)



<a name="0.11.2-ghost.3"></a>
## <small>0.11.2-ghost.3 (2019-05-04)</small>

* 🐛 Fixed parser plugin handling of top-level comment nodes ([4696bfe](https://github.com/bustle/mobiledoc-kit/commit/4696bfe))
* v0.11.2-ghost.3 ([228e2e4](https://github.com/bustle/mobiledoc-kit/commit/228e2e4))



<a name="0.11.2-ghost.2"></a>
## <small>0.11.2-ghost.2 (2019-05-03)</small>

* 🐛 Fixed atoms with no text value being removed when parsing top-level markerables ([8d5b337](https://github.com/bustle/mobiledoc-kit/commit/8d5b337))
* 🐛 Fixed atoms with no text value being removed when parsing top-level markerables ([4828dd6](https://github.com/bustle/mobiledoc-kit/commit/4828dd6))
* Uncomment "FIXME" Google Docs nested uls test ([9e4a4c8](https://github.com/bustle/mobiledoc-kit/commit/9e4a4c8))
* Uncomment "FIXME" Google Docs nested uls test (#678) ([358cd9d](https://github.com/bustle/mobiledoc-kit/commit/358cd9d)), closes [#678](https://github.com/bustle/mobiledoc-kit/issues/678)
* v0.11.2-ghost.2 ([b808ae7](https://github.com/bustle/mobiledoc-kit/commit/b808ae7))



<a name="0.11.2-ghost.1"></a>
## <small>0.11.2-ghost.1 (2019-04-29)</small>

* Fixed range#expandByMarker not expanding to beginning/end of section ([ab01ecb](https://github.com/bustle/mobiledoc-kit/commit/ab01ecb))
* v0.11.2-ghost.1 ([2a24702](https://github.com/bustle/mobiledoc-kit/commit/2a24702))



<a name="0.11.2"></a>
## <small>0.11.2 (2019-03-31)</small>

* Bump travis to Node 8 ([ac8b89f](https://github.com/bustle/mobiledoc-kit/commit/ac8b89f))
* Bump yarn deps ([f85346a](https://github.com/bustle/mobiledoc-kit/commit/f85346a))
* Drop Safari from the base testem ([f1486a6](https://github.com/bustle/mobiledoc-kit/commit/f1486a6))
* fix error parsing list sections containing text nodes from indented HTML ([002f0d6](https://github.com/bustle/mobiledoc-kit/commit/002f0d6))
* handle parsing of lists when wrapped with indented html ([ca8c6c5](https://github.com/bustle/mobiledoc-kit/commit/ca8c6c5))
* trim leading/trailing whitespace from sections that can occur when parsing indented HTML ([333c293](https://github.com/bustle/mobiledoc-kit/commit/333c293))
* v0.11.2 ([2104893](https://github.com/bustle/mobiledoc-kit/commit/2104893))



<a name="0.11.1-ghost.7"></a>
## <small>0.11.1-ghost.7 (2019-02-22)</small>

* fix error parsing list sections containing text nodes from indented HTML ([5b5296e](https://github.com/bustle/mobiledoc-kit/commit/5b5296e))
* handle parsing of lists when wrapped with indented html ([b7fe611](https://github.com/bustle/mobiledoc-kit/commit/b7fe611))
* trim leading/trailing whitespace from sections that can occur when parsing indented HTML ([07b6739](https://github.com/bustle/mobiledoc-kit/commit/07b6739))
* v0.11.1-ghost.7 ([6014f3f](https://github.com/bustle/mobiledoc-kit/commit/6014f3f))



<a name="0.11.1-ghost.6"></a>
## <small>0.11.1-ghost.6 (2019-02-13)</small>

* add failing test for #648 ([29ff9e7](https://github.com/bustle/mobiledoc-kit/commit/29ff9e7)), closes [#648](https://github.com/bustle/mobiledoc-kit/issues/648)
* add failing test for list-items being appended as top-level sections ([548fcbf](https://github.com/bustle/mobiledoc-kit/commit/548fcbf))
* add failing test for nested lists ([40ddff3](https://github.com/bustle/mobiledoc-kit/commit/40ddff3))
* add failing test for nested lists of different types ([c88d6b8](https://github.com/bustle/mobiledoc-kit/commit/c88d6b8))
* add test for paragraph in list item parsing behaviour ([be9f27b](https://github.com/bustle/mobiledoc-kit/commit/be9f27b))
* add tests for dom and section parser ignoring blank markup sections ([100c5fb](https://github.com/bustle/mobiledoc-kit/commit/100c5fb))
* Added more failing tests for 648 ([2eed96e](https://github.com/bustle/mobiledoc-kit/commit/2eed96e))
* do not group consecutive list sections of different types ([45e4d27](https://github.com/bustle/mobiledoc-kit/commit/45e4d27))
* Export MOBILEDOC_VERSION & mobiledocRenderers from index ([acbb829](https://github.com/bustle/mobiledoc-kit/commit/acbb829))
* failing test for #656 ([4bcbec6](https://github.com/bustle/mobiledoc-kit/commit/4bcbec6)), closes [#656](https://github.com/bustle/mobiledoc-kit/issues/656) [#656](https://github.com/bustle/mobiledoc-kit/issues/656)
* failing test for section parser handling consecutive lists of varying types ([66d2120](https://github.com/bustle/mobiledoc-kit/commit/66d2120))
* Fix format readme missing word ([27b4588](https://github.com/bustle/mobiledoc-kit/commit/27b4588))
* fix grouping of nested lists into single top-level list ([a5353ff](https://github.com/bustle/mobiledoc-kit/commit/a5353ff))
* fix handling of nested list sections of different types ([2019c94](https://github.com/bustle/mobiledoc-kit/commit/2019c94))
* fix list-items being added as top-level sections when breaking out of lists ([821bf2e](https://github.com/bustle/mobiledoc-kit/commit/821bf2e))
* fixed SectionParser handling of paragraph following a list ([892b66a](https://github.com/bustle/mobiledoc-kit/commit/892b66a))
* fixed SectionParser handling of paragraph following single-marker markup section ([c6ad8cd](https://github.com/bustle/mobiledoc-kit/commit/c6ad8cd))
* Further improvements to tests ([83356fa](https://github.com/bustle/mobiledoc-kit/commit/83356fa))
* handle nested section-creating elements correctly in SectionParser ([dfcadc3](https://github.com/bustle/mobiledoc-kit/commit/dfcadc3))
* v0.11.1-ghost.6 ([8acf611](https://github.com/bustle/mobiledoc-kit/commit/8acf611))



<a name="0.11.1-ghost.5"></a>
## <small>0.11.1-ghost.5 (2018-11-21)</small>

* add nested structure tests from #654 ([8b1d241](https://github.com/bustle/mobiledoc-kit/commit/8b1d241)), closes [#654](https://github.com/bustle/mobiledoc-kit/issues/654)
* failing test for #656 ([db7f5c8](https://github.com/bustle/mobiledoc-kit/commit/db7f5c8)), closes [#656](https://github.com/bustle/mobiledoc-kit/issues/656) [#656](https://github.com/bustle/mobiledoc-kit/issues/656)
* handle nested section-creating elements correctly in SectionParser ([d235c52](https://github.com/bustle/mobiledoc-kit/commit/d235c52))
* Revert "Fix issue #592" ([62da2b7](https://github.com/bustle/mobiledoc-kit/commit/62da2b7)), closes [#592](https://github.com/bustle/mobiledoc-kit/issues/592)
* v0.11.1-ghost.5 ([f34fdf5](https://github.com/bustle/mobiledoc-kit/commit/f34fdf5))



<a name="0.11.1-ghost.4"></a>
## <small>0.11.1-ghost.4 (2018-11-19)</small>

* add failing test for #642 ([18d53a1](https://github.com/bustle/mobiledoc-kit/commit/18d53a1)), closes [#642](https://github.com/bustle/mobiledoc-kit/issues/642)
* Add some docs re: the newline in matchers ([7e11dfd](https://github.com/bustle/mobiledoc-kit/commit/7e11dfd))
* Changed module scope to @tryghost ([8f94b80](https://github.com/bustle/mobiledoc-kit/commit/8f94b80))
* Fix json format issue in card description ([f095bb6](https://github.com/bustle/mobiledoc-kit/commit/f095bb6))
* Fix website typo (#652) ([1f115a0](https://github.com/bustle/mobiledoc-kit/commit/1f115a0)), closes [#652](https://github.com/bustle/mobiledoc-kit/issues/652)
* Fixed copy/paste of card section following a list section ([5a171e1](https://github.com/bustle/mobiledoc-kit/commit/5a171e1))
* Fixed Ctrl+Backspace word delete on Linux ([c523c92](https://github.com/bustle/mobiledoc-kit/commit/c523c92)), closes [#634](https://github.com/bustle/mobiledoc-kit/issues/634)
* Fixed word movements stopping on accented/non-latin chars ([a192cdb](https://github.com/bustle/mobiledoc-kit/commit/a192cdb)), closes [#628](https://github.com/bustle/mobiledoc-kit/issues/628)
* trigger handlers without inserting newline ([71c438c](https://github.com/bustle/mobiledoc-kit/commit/71c438c))
* v0.11.1-ghost.4 ([44da14c](https://github.com/bustle/mobiledoc-kit/commit/44da14c))



<a name="0.11.1"></a>
## <small>0.11.1 (2018-06-21)</small>

* v0.11.1 ([9cbb2ba](https://github.com/bustle/mobiledoc-kit/commit/9cbb2ba))



<a name="0.11.0"></a>
## 0.11.0 (2018-06-21)

* Add react renderer to readme ([04e20ae](https://github.com/bustle/mobiledoc-kit/commit/04e20ae))
* Avoid running top-level text nodes through parserPlugins twice ([9de4405](https://github.com/bustle/mobiledoc-kit/commit/9de4405))
* Be more patient for Safari getting focus ([c82acfe](https://github.com/bustle/mobiledoc-kit/commit/c82acfe))
* Bump yarn.lock ([215e755](https://github.com/bustle/mobiledoc-kit/commit/215e755))
* Failing tests for #494 ([be446f6](https://github.com/bustle/mobiledoc-kit/commit/be446f6)), closes [#494](https://github.com/bustle/mobiledoc-kit/issues/494)
* Fix error when pasting HTML that parses to a blank doc ([cd7fa1d](https://github.com/bustle/mobiledoc-kit/commit/cd7fa1d)), closes [#619](https://github.com/bustle/mobiledoc-kit/issues/619)
* Fix issue #592 ([d318a2b](https://github.com/bustle/mobiledoc-kit/commit/d318a2b)), closes [#592](https://github.com/bustle/mobiledoc-kit/issues/592)
* Fix sticky modifier keys for word deletion ([fce2d90](https://github.com/bustle/mobiledoc-kit/commit/fce2d90))
* Fix typo in README.md ([1abaf40](https://github.com/bustle/mobiledoc-kit/commit/1abaf40))
* Run parser plugins for top-level unknown elements ([daf2fe0](https://github.com/bustle/mobiledoc-kit/commit/daf2fe0))
* Scope package.json scripts ([7111f85](https://github.com/bustle/mobiledoc-kit/commit/7111f85))
* v0.11.0 ([79b074d](https://github.com/bustle/mobiledoc-kit/commit/79b074d))
* chore(tests): Revert sauce connect addon (#612) ([2bcafaf](https://github.com/bustle/mobiledoc-kit/commit/2bcafaf)), closes [#612](https://github.com/bustle/mobiledoc-kit/issues/612)
* chore(upgrade): yarn upgrade (#614) ([e363b9b](https://github.com/bustle/mobiledoc-kit/commit/e363b9b)), closes [#614](https://github.com/bustle/mobiledoc-kit/issues/614)
* chore(upgrade): Yoran brondsema yarn upgrade (#613) ([2e79133](https://github.com/bustle/mobiledoc-kit/commit/2e79133)), closes [#613](https://github.com/bustle/mobiledoc-kit/issues/613)



<a name="0.10.21"></a>
## <small>0.10.21 (2018-03-02)</small>

* Fix bug #600 (#601) ([f57215f](https://github.com/bustle/mobiledoc-kit/commit/f57215f)), closes [#600](https://github.com/bustle/mobiledoc-kit/issues/600) [#601](https://github.com/bustle/mobiledoc-kit/issues/601)
* v0.10.21 ([f12c57c](https://github.com/bustle/mobiledoc-kit/commit/f12c57c))
* docs(readme): Add travis-ci badge to readme (#607) ([9e27e9a](https://github.com/bustle/mobiledoc-kit/commit/9e27e9a)), closes [#607](https://github.com/bustle/mobiledoc-kit/issues/607)
* feat(toolips): Editor link tooltips can be disabled (#602) ([7da84f8](https://github.com/bustle/mobiledoc-kit/commit/7da84f8)), closes [#602](https://github.com/bustle/mobiledoc-kit/issues/602)
* chore(ci): Fix CI: Sauce Connect, ChromeHeadless, and MS Edge (#604) ([5cc0112](https://github.com/bustle/mobiledoc-kit/commit/5cc0112)), closes [#604](https://github.com/bustle/mobiledoc-kit/issues/604) [#603](https://github.com/bustle/mobiledoc-kit/issues/603) [#595](https://github.com/bustle/mobiledoc-kit/issues/595)
* chore(ci): Improve CI builds (#605) ([ce378e2](https://github.com/bustle/mobiledoc-kit/commit/ce378e2)), closes [#605](https://github.com/bustle/mobiledoc-kit/issues/605)



<a name="0.10.20"></a>
## <small>0.10.20 (2017-11-10)</small>

* Add more detail to format documentation (#585) ([2d85ea1](https://github.com/bustle/mobiledoc-kit/commit/2d85ea1)), closes [#585](https://github.com/bustle/mobiledoc-kit/issues/585)
* Fix broken link in README (#586) ([1d4796b](https://github.com/bustle/mobiledoc-kit/commit/1d4796b)), closes [#586](https://github.com/bustle/mobiledoc-kit/issues/586)
* Prefer KeyboardEvent.key over KeyboardEvent.keyCode (#587) ([42d8735](https://github.com/bustle/mobiledoc-kit/commit/42d8735)), closes [#587](https://github.com/bustle/mobiledoc-kit/issues/587)
* v0.10.20 ([8ae4d6b](https://github.com/bustle/mobiledoc-kit/commit/8ae4d6b))
* fix(docs): incorrect Marker definition signature (#588) ([6a6940a](https://github.com/bustle/mobiledoc-kit/commit/6a6940a)), closes [#588](https://github.com/bustle/mobiledoc-kit/issues/588)
* chore(scripts): Clean up package.json test:ci script (#580) ([00528be](https://github.com/bustle/mobiledoc-kit/commit/00528be)), closes [#580](https://github.com/bustle/mobiledoc-kit/issues/580)



<a name="0.10.19"></a>
## <small>0.10.19 (2017-08-31)</small>

* v0.10.19 ([766fba5](https://github.com/bustle/mobiledoc-kit/commit/766fba5))
* chore: upgrade deps (#579) ([1a379e9](https://github.com/bustle/mobiledoc-kit/commit/1a379e9)), closes [#579](https://github.com/bustle/mobiledoc-kit/issues/579)
* chore(ci): use chrome at travis (#577) ([c33b804](https://github.com/bustle/mobiledoc-kit/commit/c33b804)), closes [#577](https://github.com/bustle/mobiledoc-kit/issues/577)
* chore(ci): use travis sauce_connect addon (#578) ([2338b25](https://github.com/bustle/mobiledoc-kit/commit/2338b25)), closes [#578](https://github.com/bustle/mobiledoc-kit/issues/578)
* fix: Fix non-printable keys in firefox (#575) ([b47f6d9](https://github.com/bustle/mobiledoc-kit/commit/b47f6d9)), closes [#575](https://github.com/bustle/mobiledoc-kit/issues/575)



<a name="0.10.18"></a>
## <small>0.10.18 (2017-08-17)</small>

* v0.10.18 ([4a56c90](https://github.com/bustle/mobiledoc-kit/commit/4a56c90))
* fix(disableEditing): Disable event manager when editing is disabled (#573) ([64c7f6c](https://github.com/bustle/mobiledoc-kit/commit/64c7f6c)), closes [#573](https://github.com/bustle/mobiledoc-kit/issues/573) [#572](https://github.com/bustle/mobiledoc-kit/issues/572)



<a name="0.10.17"></a>
## <small>0.10.17 (2017-08-14)</small>

* built website from 1222772e6c820f59df91a8cf95f04bf340fb7fbf ([e75e339](https://github.com/bustle/mobiledoc-kit/commit/e75e339))
* chore:(yarn Updates) (#564) ([63f50a5](https://github.com/bustle/mobiledoc-kit/commit/63f50a5)), closes [#564](https://github.com/bustle/mobiledoc-kit/issues/564)
* Small build cleanup ([1f7f40c](https://github.com/bustle/mobiledoc-kit/commit/1f7f40c))
* Tweak README.md for website stuff ([aa7b23f](https://github.com/bustle/mobiledoc-kit/commit/aa7b23f))
* v0.10.17 ([3d8cf49](https://github.com/bustle/mobiledoc-kit/commit/3d8cf49))
* yarn upgrade ([d760e89](https://github.com/bustle/mobiledoc-kit/commit/d760e89))
* feat(beforeToggleMarkup): Add Editor#beforeToggleMarkup hook (#571) ([6017e56](https://github.com/bustle/mobiledoc-kit/commit/6017e56)), closes [#571](https://github.com/bustle/mobiledoc-kit/issues/571)
* feat(toggleMarkup): Editor#toggleMarkup accepts attributes (#569) ([de70839](https://github.com/bustle/mobiledoc-kit/commit/de70839)), closes [#569](https://github.com/bustle/mobiledoc-kit/issues/569)
* fix(tab character insertion): Key#isTab is false if a modifier key is pressed (#566) ([ecf5912](https://github.com/bustle/mobiledoc-kit/commit/ecf5912)), closes [#566](https://github.com/bustle/mobiledoc-kit/issues/566) [#565](https://github.com/bustle/mobiledoc-kit/issues/565)
* fix(tooltip): Hide link tooltip if that link is toggled off (#568) ([29dfca5](https://github.com/bustle/mobiledoc-kit/commit/29dfca5)), closes [#568](https://github.com/bustle/mobiledoc-kit/issues/568)
* chore(eslint): Move to ESLint (#563) ([26364f4](https://github.com/bustle/mobiledoc-kit/commit/26364f4)), closes [#563](https://github.com/bustle/mobiledoc-kit/issues/563)



<a name="0.10.16"></a>
## <small>0.10.16 (2017-05-25)</small>

* 0.10.16 ([1222772](https://github.com/bustle/mobiledoc-kit/commit/1222772))
* Fix minor typos in README ([eaa712a](https://github.com/bustle/mobiledoc-kit/commit/eaa712a))
* fix: issue #551 (#554) ([0a09408](https://github.com/bustle/mobiledoc-kit/commit/0a09408)), closes [#551](https://github.com/bustle/mobiledoc-kit/issues/551) [#554](https://github.com/bustle/mobiledoc-kit/issues/554)
* fix(486): Constrain selection to editor element when probing for range (#542) ([9b7f58c](https://github.com/bustle/mobiledoc-kit/commit/9b7f58c)), closes [#542](https://github.com/bustle/mobiledoc-kit/issues/542) [#486](https://github.com/bustle/mobiledoc-kit/issues/486)
* chore: Updates of devDependencies (#555) ([96350a5](https://github.com/bustle/mobiledoc-kit/commit/96350a5)), closes [#555](https://github.com/bustle/mobiledoc-kit/issues/555)
* chore(tests): Ensure TestLoader module load failures are counted as test failures (#541) ([749eec0](https://github.com/bustle/mobiledoc-kit/commit/749eec0)), closes [#541](https://github.com/bustle/mobiledoc-kit/issues/541)
* docs: Document inputModeDidChange() lifecycle hook (#553) ([88c5bda](https://github.com/bustle/mobiledoc-kit/commit/88c5bda)), closes [#553](https://github.com/bustle/mobiledoc-kit/issues/553)
* docs: Fix typo in documentation (#556) ([f128d5e](https://github.com/bustle/mobiledoc-kit/commit/f128d5e)), closes [#556](https://github.com/bustle/mobiledoc-kit/issues/556)
* docs(rename): renaming bustlelabs -> bustle with the exception of gitter.im links (#560) ([cf2eee6](https://github.com/bustle/mobiledoc-kit/commit/cf2eee6)), closes [#560](https://github.com/bustle/mobiledoc-kit/issues/560)



<a name="0.10.15"></a>
## <small>0.10.15 (2017-03-10)</small>

* 0.10.15 ([91041c7](https://github.com/bustle/mobiledoc-kit/commit/91041c7))
* Allows users to add an optional `name` attribute to a keyCommand object as passed to the `registerKe ([0cc12d3](https://github.com/bustle/mobiledoc-kit/commit/0cc12d3)), closes [#534](https://github.com/bustle/mobiledoc-kit/issues/534)
* fix github url at demo page (#536) ([4fd6cf0](https://github.com/bustle/mobiledoc-kit/commit/4fd6cf0)), closes [#536](https://github.com/bustle/mobiledoc-kit/issues/536)
* Fixed broken logo link and removed Gitter link ([5179440](https://github.com/bustle/mobiledoc-kit/commit/5179440))
* Made content more explicit. ([a94190a](https://github.com/bustle/mobiledoc-kit/commit/a94190a))
* Replaced gitter with slack. ([daa81dc](https://github.com/bustle/mobiledoc-kit/commit/daa81dc))
* chore: Replace deprecated mobiledoc-html-renderer with mobiledoc-dom-renderer (#538) ([2295cfc](https://github.com/bustle/mobiledoc-kit/commit/2295cfc)), closes [#538](https://github.com/bustle/mobiledoc-kit/issues/538)
* chore: Upgrade broccoli dependencies (#539) ([3155800](https://github.com/bustle/mobiledoc-kit/commit/3155800)), closes [#539](https://github.com/bustle/mobiledoc-kit/issues/539)
* chore: Upgrade saucie to latest (#540) ([9662756](https://github.com/bustle/mobiledoc-kit/commit/9662756)), closes [#540](https://github.com/bustle/mobiledoc-kit/issues/540)
* style(css): Drop LESS dependency (#537) ([e9d0276](https://github.com/bustle/mobiledoc-kit/commit/e9d0276)), closes [#537](https://github.com/bustle/mobiledoc-kit/issues/537)
* docs(README): added vue-mobiledoc-editor to library options (#531) ([c0d4cf3](https://github.com/bustle/mobiledoc-kit/commit/c0d4cf3)), closes [#531](https://github.com/bustle/mobiledoc-kit/issues/531)



<a name="0.10.14"></a>
## <small>0.10.14 (2017-02-11)</small>

* 0.10.14 ([441897f](https://github.com/bustle/mobiledoc-kit/commit/441897f))



<a name="0.10.14-0"></a>
## <small>0.10.14-0 (2016-11-17)</small>

* 0.10.14-0 ([a13748a](https://github.com/bustle/mobiledoc-kit/commit/a13748a))
* Bump saucie and other deps ([88b98dc](https://github.com/bustle/mobiledoc-kit/commit/88b98dc))
* Default tests to run on all IPs ([a5c5f2a](https://github.com/bustle/mobiledoc-kit/commit/a5c5f2a))
* Grouped undo and redo statements. refs #502 ([ce4d8d4](https://github.com/bustle/mobiledoc-kit/commit/ce4d8d4)), closes [#502](https://github.com/bustle/mobiledoc-kit/issues/502)
* Install phantom after yarn ([c98ba15](https://github.com/bustle/mobiledoc-kit/commit/c98ba15))
* Mobiledoc format 0.3.1, new section and markup tags ([57670bb](https://github.com/bustle/mobiledoc-kit/commit/57670bb))
* Refactor undo/redo tests to avoid timeouts ([9a5244a](https://github.com/bustle/mobiledoc-kit/commit/9a5244a))



<a name="0.10.13"></a>
## <small>0.10.13 (2016-11-14)</small>

* 0.10.12 ([cf115f1](https://github.com/bustle/mobiledoc-kit/commit/cf115f1))
* 0.10.13 ([a705767](https://github.com/bustle/mobiledoc-kit/commit/a705767))
* Add range#expandByMarker, list#detect with reverse ([254dfbc](https://github.com/bustle/mobiledoc-kit/commit/254dfbc))
* Add suggestion to specify utf-8 ([bbc3b15](https://github.com/bustle/mobiledoc-kit/commit/bbc3b15))
* built website from 915e516e9d9088f265b45f3b6087c543719efa52 ([1d53f94](https://github.com/bustle/mobiledoc-kit/commit/1d53f94))
* Correct ref to rel attribute ([3aeb1d0](https://github.com/bustle/mobiledoc-kit/commit/3aeb1d0))
* Corrects "Cards and Atoms" demo code sample ([bf2eaff](https://github.com/bustle/mobiledoc-kit/commit/bf2eaff))
* Document some of the Range, Position APIs ([bb59d0e](https://github.com/bustle/mobiledoc-kit/commit/bb59d0e))
* Update travis config to use newer phantomjs ([0af0a7f](https://github.com/bustle/mobiledoc-kit/commit/0af0a7f))
* chore(deps): update yarn.lock ([915e516](https://github.com/bustle/mobiledoc-kit/commit/915e516))
* chore(package): update jsdoc to version 3.4.2 (#501) ([8f48cbb](https://github.com/bustle/mobiledoc-kit/commit/8f48cbb)), closes [#501](https://github.com/bustle/mobiledoc-kit/issues/501)
* chore(package): update tiny-lr to version 1.0.2 (#505) ([29f35a7](https://github.com/bustle/mobiledoc-kit/commit/29f35a7)), closes [#505](https://github.com/bustle/mobiledoc-kit/issues/505)
* chore(website): Use plain-js demo (#509) ([a6e5805](https://github.com/bustle/mobiledoc-kit/commit/a6e5805)), closes [#509](https://github.com/bustle/mobiledoc-kit/issues/509)
* chore(yarn): use yarn, update readme (#508) ([0271871](https://github.com/bustle/mobiledoc-kit/commit/0271871)), closes [#508](https://github.com/bustle/mobiledoc-kit/issues/508)
* docs(README): Add table to README (#506) ([b75b0d3](https://github.com/bustle/mobiledoc-kit/commit/b75b0d3)), closes [#506](https://github.com/bustle/mobiledoc-kit/issues/506)
* fix(paste): Fix bug #498:  Pasting into an empty Mobiledoc via the browser File menu does not work ( ([c75711c](https://github.com/bustle/mobiledoc-kit/commit/c75711c)), closes [#498](https://github.com/bustle/mobiledoc-kit/issues/498) [#499](https://github.com/bustle/mobiledoc-kit/issues/499) [#498](https://github.com/bustle/mobiledoc-kit/issues/498)



<a name="0.10.11"></a>
## <small>0.10.11 (2016-09-14)</small>

* 0.10.11 ([8a3633e](https://github.com/bustle/mobiledoc-kit/commit/8a3633e))
* chore(exports): Export additional modules for selective importing (#493) ([5667a34](https://github.com/bustle/mobiledoc-kit/commit/5667a34)), closes [#493](https://github.com/bustle/mobiledoc-kit/issues/493)



<a name="0.10.11-beta.1"></a>
## <small>0.10.11-beta.1 (2016-09-13)</small>

* 0.10.11-beta.1 ([39e3026](https://github.com/bustle/mobiledoc-kit/commit/39e3026))
* fix(ui): Fix UI export (#492) ([08c0c24](https://github.com/bustle/mobiledoc-kit/commit/08c0c24)), closes [#492](https://github.com/bustle/mobiledoc-kit/issues/492)



<a name="0.10.10"></a>
## <small>0.10.10 (2016-09-13)</small>

* 0.10.10 ([3d3bc2e](https://github.com/bustle/mobiledoc-kit/commit/3d3bc2e))
* feat(textInput): able to unregister single or all text input handlers (#484) ([68a60ae](https://github.com/bustle/mobiledoc-kit/commit/68a60ae)), closes [#484](https://github.com/bustle/mobiledoc-kit/issues/484)
* feat(UI): Export toggleLink (#491) ([3335357](https://github.com/bustle/mobiledoc-kit/commit/3335357)), closes [#491](https://github.com/bustle/mobiledoc-kit/issues/491)
* feat(willHandleNewline): add willHandleNewline hook (#489) ([f1d2262](https://github.com/bustle/mobiledoc-kit/commit/f1d2262)), closes [#489](https://github.com/bustle/mobiledoc-kit/issues/489)
* docs(grammarly): DOC - Add section about disabling Grammarly (#490) ([bbf3cfd](https://github.com/bustle/mobiledoc-kit/commit/bbf3cfd)), closes [#490](https://github.com/bustle/mobiledoc-kit/issues/490)
* fix(deprecate): Make deprecate accept conditional argument (#488) ([059fd66](https://github.com/bustle/mobiledoc-kit/commit/059fd66)), closes [#488](https://github.com/bustle/mobiledoc-kit/issues/488)



<a name="0.10.9"></a>
## <small>0.10.9 (2016-08-31)</small>

* 0.10.9 ([2fe7f0f](https://github.com/bustle/mobiledoc-kit/commit/2fe7f0f))
* fix(newlines). Remove newline chars in text nodes (`\n`) when parsing HTML (#478) ([6036b90](https://github.com/bustle/mobiledoc-kit/commit/6036b90)), closes [#478](https://github.com/bustle/mobiledoc-kit/issues/478) [#333](https://github.com/bustle/mobiledoc-kit/issues/333)
* fix(range) Allow reading range from DOM when editor is disabled (#476) ([6969f5c](https://github.com/bustle/mobiledoc-kit/commit/6969f5c)), closes [#476](https://github.com/bustle/mobiledoc-kit/issues/476) [#475](https://github.com/bustle/mobiledoc-kit/issues/475)
* refactor(cleanup) Remove unused methods from `Post`, `Markerable` (#474) ([235f7a3](https://github.com/bustle/mobiledoc-kit/commit/235f7a3)), closes [#474](https://github.com/bustle/mobiledoc-kit/issues/474)
* fix(onTextInput): Ensure `onTextInput` is triggered by tab character (#479) ([a0aaa3a](https://github.com/bustle/mobiledoc-kit/commit/a0aaa3a)), closes [#479](https://github.com/bustle/mobiledoc-kit/issues/479) [#400](https://github.com/bustle/mobiledoc-kit/issues/400)



<a name="0.10.8"></a>
## <small>0.10.8 (2016-08-25)</small>

* 0.10.8 ([1cef370](https://github.com/bustle/mobiledoc-kit/commit/1cef370))
* feat(atom): Implement Atom `save` hook (#472) ([3ef3bc3](https://github.com/bustle/mobiledoc-kit/commit/3ef3bc3)), closes [#472](https://github.com/bustle/mobiledoc-kit/issues/472) [#399](https://github.com/bustle/mobiledoc-kit/issues/399)
* fix(atoms): Avoid rerendering atoms when section content changes. (#471) ([a59ae74](https://github.com/bustle/mobiledoc-kit/commit/a59ae74)), closes [#471](https://github.com/bustle/mobiledoc-kit/issues/471) [#421](https://github.com/bustle/mobiledoc-kit/issues/421)



<a name="0.10.8-beta.1"></a>
## <small>0.10.8-beta.1 (2016-08-25)</small>

* 0.10.8-beta.1 ([e3efb98](https://github.com/bustle/mobiledoc-kit/commit/e3efb98))
* fix(placeholder): Use '__has-no-content' class name to display placeholder text (#461) ([11452fe](https://github.com/bustle/mobiledoc-kit/commit/11452fe)), closes [#461](https://github.com/bustle/mobiledoc-kit/issues/461) [#407](https://github.com/bustle/mobiledoc-kit/issues/407) [#171](https://github.com/bustle/mobiledoc-kit/issues/171)
* refactor(tests): Refactor deletion tests to be terser (#469) ([eeb9e19](https://github.com/bustle/mobiledoc-kit/commit/eeb9e19)), closes [#469](https://github.com/bustle/mobiledoc-kit/issues/469)



<a name="0.10.7"></a>
## <small>0.10.7 (2016-08-24)</small>

* 0.10.7 ([919600c](https://github.com/bustle/mobiledoc-kit/commit/919600c))
* fix(paste): Fix insertion into blank section (#466) ([a3d274d](https://github.com/bustle/mobiledoc-kit/commit/a3d274d)), closes [#466](https://github.com/bustle/mobiledoc-kit/issues/466) [#462](https://github.com/bustle/mobiledoc-kit/issues/462)
* fix(paste): Handle paste card at start of middle list item (#468) ([939a541](https://github.com/bustle/mobiledoc-kit/commit/939a541)), closes [#468](https://github.com/bustle/mobiledoc-kit/issues/468) [#467](https://github.com/bustle/mobiledoc-kit/issues/467)
* doc(jsdoc): Fix JSDocs violations and typo (#463) ([843f381](https://github.com/bustle/mobiledoc-kit/commit/843f381)), closes [#463](https://github.com/bustle/mobiledoc-kit/issues/463)
* doc(jsdoc): Make building docs part of testing, to avoid jsdocs errors (#464) ([039fd04](https://github.com/bustle/mobiledoc-kit/commit/039fd04)), closes [#464](https://github.com/bustle/mobiledoc-kit/issues/464)
* feat(post): Refactor rendering of editor element (#460) ([c9d4067](https://github.com/bustle/mobiledoc-kit/commit/c9d4067)), closes [#460](https://github.com/bustle/mobiledoc-kit/issues/460) [#335](https://github.com/bustle/mobiledoc-kit/issues/335)



<a name="0.10.6"></a>
## <small>0.10.6 (2016-08-23)</small>

* 0.10.6 ([c3aed98](https://github.com/bustle/mobiledoc-kit/commit/c3aed98))
* feat(delete): add delete hooks in lifecycle (#454) ([f7c72cd](https://github.com/bustle/mobiledoc-kit/commit/f7c72cd)), closes [#454](https://github.com/bustle/mobiledoc-kit/issues/454)
* feat(delete): add range, direction and unit to delete hook (#455) ([2884ebf](https://github.com/bustle/mobiledoc-kit/commit/2884ebf)), closes [#455](https://github.com/bustle/mobiledoc-kit/issues/455)
* fix(paste): Allow inserting multiple markup sections onto a list item (#459) ([1898cf5](https://github.com/bustle/mobiledoc-kit/commit/1898cf5)), closes [#459](https://github.com/bustle/mobiledoc-kit/issues/459) [#456](https://github.com/bustle/mobiledoc-kit/issues/456)



<a name="0.10.5"></a>
## <small>0.10.5 (2016-08-16)</small>

* 0.10.5 ([9c14bb3](https://github.com/bustle/mobiledoc-kit/commit/9c14bb3))
* fix(links): Ensure that CTRL+K on Windows toggles link. Fixes #452 (#453) ([3220534](https://github.com/bustle/mobiledoc-kit/commit/3220534)), closes [#452](https://github.com/bustle/mobiledoc-kit/issues/452) [#453](https://github.com/bustle/mobiledoc-kit/issues/453)
* style(links): Add nobreak to links in the editor so toolips are always accessible (#449) ([b75bb7d](https://github.com/bustle/mobiledoc-kit/commit/b75bb7d)), closes [#449](https://github.com/bustle/mobiledoc-kit/issues/449)
* docs(changelog): Update changelog manually ([2ceb39d](https://github.com/bustle/mobiledoc-kit/commit/2ceb39d))



<a name="0.10.4"></a>
## <small>0.10.4 (2016-08-04)</small>

* 0.10.4 ([8674702](https://github.com/bustle/mobiledoc-kit/commit/8674702))



<a name="0.10.4-beta.1"></a>
## <small>0.10.4-beta.1 (2016-08-04)</small>

* 0.10.4-beta.1 ([77eb772](https://github.com/bustle/mobiledoc-kit/commit/77eb772))
* Add `buildWithText` test helper, `postEditor#deleteRange` ([3327408](https://github.com/bustle/mobiledoc-kit/commit/3327408))
* Add `postEditor#deleteAtPosition`, deprecate `deleteFrom` ([92c3eb6](https://github.com/bustle/mobiledoc-kit/commit/92c3eb6))
* Add `toRange` and `toPosition` methods to Position, Section, Post ([c7ec6eb](https://github.com/bustle/mobiledoc-kit/commit/c7ec6eb)), closes [#258](https://github.com/bustle/mobiledoc-kit/issues/258)
* Refactor `deleteRange` ([54f56cc](https://github.com/bustle/mobiledoc-kit/commit/54f56cc))
* remove post#sectionsContainedBy(range) ([27ba974](https://github.com/bustle/mobiledoc-kit/commit/27ba974))
* update changelog ([844239a](https://github.com/bustle/mobiledoc-kit/commit/844239a))
* Update demo to ember-cli@2.6.0 ([e8f9ac8](https://github.com/bustle/mobiledoc-kit/commit/e8f9ac8))
* update demo to ember-mobiledoc-editor 0.5.3 ([05ca4d3](https://github.com/bustle/mobiledoc-kit/commit/05ca4d3))
* update mobiledoc-pretty-json-renderer to ^2.0.1 ([9ff9f13](https://github.com/bustle/mobiledoc-kit/commit/9ff9f13))
* Use "version" script instead of postversion with --amend --no-edit ([13abc9d](https://github.com/bustle/mobiledoc-kit/commit/13abc9d))
* docs: `replaceWithListSection` and `replaceWithHeaderSection` ([2b65ad5](https://github.com/bustle/mobiledoc-kit/commit/2b65ad5))
* Tests: Extract `MockEditor`, `run`, `renderBuiltAbstract`, docs for `buildFromText` ([b473a27](https://github.com/bustle/mobiledoc-kit/commit/b473a27))



<a name="0.10.3"></a>
## <small>0.10.3 (2016-07-26)</small>

* 0.10.3 ([b7e4ca5](https://github.com/bustle/mobiledoc-kit/commit/b7e4ca5))
* Un-deprecate editor#hasActiveMarkups, remove editor#markupsInSelection ([de9d7c5](https://github.com/bustle/mobiledoc-kit/commit/de9d7c5))



<a name="0.10.2"></a>
## <small>0.10.2 (2016-07-26)</small>

* 0.10.2 ([3f7eb68](https://github.com/bustle/mobiledoc-kit/commit/3f7eb68))
* Add forward/backward inclusivity rules for markups fix #402 fix #392 ([300019f](https://github.com/bustle/mobiledoc-kit/commit/300019f)), closes [#402](https://github.com/bustle/mobiledoc-kit/issues/402) [#392](https://github.com/bustle/mobiledoc-kit/issues/392) [#392](https://github.com/bustle/mobiledoc-kit/issues/392) [#402](https://github.com/bustle/mobiledoc-kit/issues/402)
* Add support for word deletion on Mac (opt+del) and PC (ctrl+del) Fix #169 ([f919490](https://github.com/bustle/mobiledoc-kit/commit/f919490)), closes [#169](https://github.com/bustle/mobiledoc-kit/issues/169)
* Fix incorrect test helper imports ([95b1797](https://github.com/bustle/mobiledoc-kit/commit/95b1797))
* Fix method signature for `createListItem` in ListItem#clone ([d131f17](https://github.com/bustle/mobiledoc-kit/commit/d131f17))
* Refocus editor after toggling markup when no selection. fixes #369 (#436) ([01b2e5e](https://github.com/bustle/mobiledoc-kit/commit/01b2e5e)), closes [#369](https://github.com/bustle/mobiledoc-kit/issues/369) [#436](https://github.com/bustle/mobiledoc-kit/issues/436)
* Remove deprecated Post#cloneRange Editor#registerExpansion, Editor#on ([272a2c7](https://github.com/bustle/mobiledoc-kit/commit/272a2c7))
* Update ember-mobiledoc-editor for demo/ ([4fbd912](https://github.com/bustle/mobiledoc-kit/commit/4fbd912))
* update relase instructions in readme ([89f1b58](https://github.com/bustle/mobiledoc-kit/commit/89f1b58))



<a name="0.10.1"></a>
## <small>0.10.1 (2016-07-15)</small>

* [demo] fix simple card demo (include "remove" button) ([82a141c](https://github.com/bustle/mobiledoc-kit/commit/82a141c))
* 0.10.1 ([63c1912](https://github.com/bustle/mobiledoc-kit/commit/63c1912))
* Ensure the activeElement is set after rendering cursor ([2ce581e](https://github.com/bustle/mobiledoc-kit/commit/2ce581e))



<a name="0.10.0"></a>
## 0.10.0 (2016-07-15)

* 0.10.0 ([270123b](https://github.com/bustle/mobiledoc-kit/commit/270123b))



<a name="0.10.0-beta.3"></a>
## 0.10.0-beta.3 (2016-07-15)

* 0.10.0-beta.2 ([4d5db27](https://github.com/bustle/mobiledoc-kit/commit/4d5db27))
* 0.10.0-beta.3 ([dc63306](https://github.com/bustle/mobiledoc-kit/commit/dc63306))
* update postversion npm script ([870d9c8](https://github.com/bustle/mobiledoc-kit/commit/870d9c8))



<a name="0.10.0-beta.1"></a>
## 0.10.0-beta.1 (2016-07-15)

* 0.10.0-beta.1 ([4cc772a](https://github.com/bustle/mobiledoc-kit/commit/4cc772a))
* Add SelectionChangeObserver, use it for editor.range updates ([2ff0590](https://github.com/bustle/mobiledoc-kit/commit/2ff0590))
* update demo app ember-cli version to 1.13.13 ([ce7f1d9](https://github.com/bustle/mobiledoc-kit/commit/ce7f1d9))
* Update npm tasks for for `np` ([fdf79c4](https://github.com/bustle/mobiledoc-kit/commit/fdf79c4))



<a name="0.9.8"></a>
## <small>0.9.8 (2016-07-07)</small>

* Add some tests for desired behavior when adding markups ([ae7f0c1](https://github.com/bustle/mobiledoc-kit/commit/ae7f0c1))
* didRender is defined on the card regardless of editing context ([a0c7b51](https://github.com/bustle/mobiledoc-kit/commit/a0c7b51))
* Document `Editor({ mobiledoc: ... })` option ([67dee12](https://github.com/bustle/mobiledoc-kit/commit/67dee12))
* Document Editor({ parserPlugins: ... }) option ([da52ebb](https://github.com/bustle/mobiledoc-kit/commit/da52ebb))
* Ensure editor instances in tests are properly torn down ([90a1f5e](https://github.com/bustle/mobiledoc-kit/commit/90a1f5e))
* Fix #addMarkupToRange documentation ([51e4627](https://github.com/bustle/mobiledoc-kit/commit/51e4627))
* Fix finicky test failure for FF at SauceLabs ([23bce3e](https://github.com/bustle/mobiledoc-kit/commit/23bce3e)), closes [#428](https://github.com/bustle/mobiledoc-kit/issues/428)
* Fix typo in README ([6594649](https://github.com/bustle/mobiledoc-kit/commit/6594649))
* It's useful to expose replace section functions ([8a5945b](https://github.com/bustle/mobiledoc-kit/commit/8a5945b))
* Pull in mobiledoc-pretty-json-renderer for the demo app ([f096b54](https://github.com/bustle/mobiledoc-kit/commit/f096b54))
* Return card and atom from high-level insert methods ([fd3dcd2](https://github.com/bustle/mobiledoc-kit/commit/fd3dcd2))
* Tweak postEditor#addMarkupToRange to consider existing markups ([18463b9](https://github.com/bustle/mobiledoc-kit/commit/18463b9)), closes [#360](https://github.com/bustle/mobiledoc-kit/issues/360)
* Use `assertEditor` helper in Helpers.dom (minor change) ([f6878e2](https://github.com/bustle/mobiledoc-kit/commit/f6878e2))
* v0.9.8 ([9a470af](https://github.com/bustle/mobiledoc-kit/commit/9a470af))
* chore(package): update jquery to version 3.0.0 ([402d949](https://github.com/bustle/mobiledoc-kit/commit/402d949))



<a name="0.9.7"></a>
## <small>0.9.7 (2016-05-31)</small>

* Add failing test. ([a6f3944](https://github.com/bustle/mobiledoc-kit/commit/a6f3944))
* add onTextInput to Editor Lifecycle Hook section ([101e639](https://github.com/bustle/mobiledoc-kit/commit/101e639)), closes [#398](https://github.com/bustle/mobiledoc-kit/issues/398)
* built website from 6e3437d74688f91838b1203dad61d1961dc7eba4 ([c74223a](https://github.com/bustle/mobiledoc-kit/commit/c74223a))
* Comment of @bantic. ([b033f02](https://github.com/bustle/mobiledoc-kit/commit/b033f02))
* fastboot-friendly browser test ([0db96d0](https://github.com/bustle/mobiledoc-kit/commit/0db96d0))
* Fix bug #395 ([7b0b97d](https://github.com/bustle/mobiledoc-kit/commit/7b0b97d)), closes [#395](https://github.com/bustle/mobiledoc-kit/issues/395)
* Fix emoji's on iPad. ([8f205b3](https://github.com/bustle/mobiledoc-kit/commit/8f205b3))
* Fix failing test on the other browsers. ([de1d869](https://github.com/bustle/mobiledoc-kit/commit/de1d869))
* Fix tests for IE11 and Edge. ([0e4803f](https://github.com/bustle/mobiledoc-kit/commit/0e4803f))
* Prevent 'Invalid argument' error when triple-clicking to select on IE ([6c41499](https://github.com/bustle/mobiledoc-kit/commit/6c41499))
* update testem to 1.7.4 ([e09e1af](https://github.com/bustle/mobiledoc-kit/commit/e09e1af))
* Use trusty dist and phantomjs-prebuilt at travis ([06853f4](https://github.com/bustle/mobiledoc-kit/commit/06853f4))
* v0.9.7 ([d829e09](https://github.com/bustle/mobiledoc-kit/commit/d829e09))
* chore(package): update testem to version 1.7.0 ([947b436](https://github.com/bustle/mobiledoc-kit/commit/947b436))



<a name="0.9.6"></a>
## <small>0.9.6 (2016-05-10)</small>

* [docs] Document card `env.didRender` hook ([3a1edde](https://github.com/bustle/mobiledoc-kit/commit/3a1edde))
* [docs] Fix markups/markers text in ATOMS.md ([8833ec7](https://github.com/bustle/mobiledoc-kit/commit/8833ec7))
* [docs] Fix transposition in mobiledoc atom docs ([995d034](https://github.com/bustle/mobiledoc-kit/commit/995d034))
* Add didRender to card lifecycle hooks ([f9e040e](https://github.com/bustle/mobiledoc-kit/commit/f9e040e))
* Added support to CMD+Left/Right for Mac navigation ([d1f7eff](https://github.com/bustle/mobiledoc-kit/commit/d1f7eff))
* built website from 5a4714193d5fb9b443d9629955617a5cee2d3c0a ([5b1dfac](https://github.com/bustle/mobiledoc-kit/commit/5b1dfac))
* Clarify test ([1896a8b](https://github.com/bustle/mobiledoc-kit/commit/1896a8b))
* Consider HOME and END keys as movement keys ([c4b2c51](https://github.com/bustle/mobiledoc-kit/commit/c4b2c51)), closes [#377](https://github.com/bustle/mobiledoc-kit/issues/377)
* Explicitly set range in some tests so they pass in Firefox ([d84c861](https://github.com/bustle/mobiledoc-kit/commit/d84c861)), closes [#388](https://github.com/bustle/mobiledoc-kit/issues/388)
* minor - update docs for onTextInput ([651bc57](https://github.com/bustle/mobiledoc-kit/commit/651bc57))
* v0.9.6 ([6e3437d](https://github.com/bustle/mobiledoc-kit/commit/6e3437d))
* chore(package): update broccoli-less-single to version 0.6.2 ([874ef2d](https://github.com/bustle/mobiledoc-kit/commit/874ef2d))
* chore(package): update conventional-changelog-cli to version 1.2.0 ([d0f1da7](https://github.com/bustle/mobiledoc-kit/commit/d0f1da7))



<a name="0.9.5"></a>
## <small>0.9.5 (2016-04-26)</small>

* [bugfix] Ensure cursor is in li after "* " expands to li ([be898fb](https://github.com/bustle/mobiledoc-kit/commit/be898fb))
* [bugfix] Ensure cursor positioning on a blank markup section or list item works ([9d20ed1](https://github.com/bustle/mobiledoc-kit/commit/9d20ed1))
* Add `Editor#onTextInput` to handle text or regex-match input ([a0347b2](https://github.com/bustle/mobiledoc-kit/commit/a0347b2)), closes [#367](https://github.com/bustle/mobiledoc-kit/issues/367)
* Add Editor#enableLogging and Editor#disableLogging ([0f54784](https://github.com/bustle/mobiledoc-kit/commit/0f54784))
* Build docs when building website ([5e05d72](https://github.com/bustle/mobiledoc-kit/commit/5e05d72))
* built website from 98999423290fe13d7276d0b07801ecb8bfb7e213 ([fbb52f4](https://github.com/bustle/mobiledoc-kit/commit/fbb52f4))
* built website from fbb52f4b0a8437866cd15e96201f1ab1559bea18 ([be85869](https://github.com/bustle/mobiledoc-kit/commit/be85869))
* Change Range#extend and Position#move to move multiple units ([bff7bc7](https://github.com/bustle/mobiledoc-kit/commit/bff7bc7))
* enable logging in demo app ([f8582fc](https://github.com/bustle/mobiledoc-kit/commit/f8582fc))
* Update README.md ([77fba45](https://github.com/bustle/mobiledoc-kit/commit/77fba45))
* v0.9.5 ([5a47141](https://github.com/bustle/mobiledoc-kit/commit/5a47141))



<a name="0.9.4"></a>
## <small>0.9.4 (2016-04-20)</small>

* Add #insertAtom and #insertCard to Editor, fix #insertText ([b14d7be](https://github.com/bustle/mobiledoc-kit/commit/b14d7be))
* Allow destroying an editor when it failed to render properly ([e16e0d6](https://github.com/bustle/mobiledoc-kit/commit/e16e0d6))
* Better description of markup attributes in MOBILEDOC.md ([f04d2e6](https://github.com/bustle/mobiledoc-kit/commit/f04d2e6))
* build docs into demo ([d2af3ac](https://github.com/bustle/mobiledoc-kit/commit/d2af3ac))
* built website from a3221dd3557ebd0215422264f6c2f7fa8cce7e59 ([ed24ba5](https://github.com/bustle/mobiledoc-kit/commit/ed24ba5))
* built website from d2af3ac0dd1fed55537b376946d38cf44da813ed ([1ce6592](https://github.com/bustle/mobiledoc-kit/commit/1ce6592))
* bump demo deps ([a3221dd](https://github.com/bustle/mobiledoc-kit/commit/a3221dd))
* change doc output to demo/public/docs ([3ca5353](https://github.com/bustle/mobiledoc-kit/commit/3ca5353))
* Ignore mutation events from within atoms ([8aac800](https://github.com/bustle/mobiledoc-kit/commit/8aac800))
* Minor changes: Remove references to embed intent, add FIXME ([46e50be](https://github.com/bustle/mobiledoc-kit/commit/46e50be))
* Update broccoli build to copy version from package.json to src/js/version.js ([ae06afc](https://github.com/bustle/mobiledoc-kit/commit/ae06afc))
* Update the README to add links to docs ([e346abd](https://github.com/bustle/mobiledoc-kit/commit/e346abd))
* v0.9.4 ([9899942](https://github.com/bustle/mobiledoc-kit/commit/9899942))



<a name="0.9.3"></a>
## <small>0.9.3 (2016-04-14)</small>

* Turn off mutation-parser logging ([4ba228d](https://github.com/bustle/mobiledoc-kit/commit/4ba228d))
* v0.9.3 ([f1faa73](https://github.com/bustle/mobiledoc-kit/commit/f1faa73))



<a name="0.9.2"></a>
## <small>0.9.2 (2016-04-14)</small>

* [BUGFIX] Ensure Editor#hasActiveMarkup detects complex markups ([36be12a](https://github.com/bustle/mobiledoc-kit/commit/36be12a))
* [BUGFIX] Ensure inputModeDidChange fires when changing from ol -> ul ([c4680aa](https://github.com/bustle/mobiledoc-kit/commit/c4680aa))
* [CLEANUP] Enable live-reload for tests ([a5f4c3d](https://github.com/bustle/mobiledoc-kit/commit/a5f4c3d))
* [CLEANUP] Fix jsdoc formatting, add `docs` npm script. ([2b28d95](https://github.com/bustle/mobiledoc-kit/commit/2b28d95))
* [CLEANUP] Improve documentation for Editor, Post, PostNodeBuilder, Range ([97140e9](https://github.com/bustle/mobiledoc-kit/commit/97140e9))
* [DOC] minor change for `activeSections` and `activeMarkups` ([1b255c1](https://github.com/bustle/mobiledoc-kit/commit/1b255c1))
* [FEATURE] [BUGFIX] Refactor editor hooks ([de52092](https://github.com/bustle/mobiledoc-kit/commit/de52092)), closes [#319](https://github.com/bustle/mobiledoc-kit/issues/319)
* built website from 36a7d5eb46db8b41887103974f59bc197adfd890 ([3fe5b35](https://github.com/bustle/mobiledoc-kit/commit/3fe5b35))
* v0.9.2 ([cb51433](https://github.com/bustle/mobiledoc-kit/commit/cb51433))
* minor: change Range docs ([d5aefae](https://github.com/bustle/mobiledoc-kit/commit/d5aefae))



<a name="0.9.1"></a>
## <small>0.9.1 (2016-03-24)</small>

* [BUGFIX] Do not handle key events when the editor has no cursor ([251675e](https://github.com/bustle/mobiledoc-kit/commit/251675e)), closes [#344](https://github.com/bustle/mobiledoc-kit/issues/344)
* [BUGFIX] up/down arrows in Firefox should not update mobiledoc ([81e1cb0](https://github.com/bustle/mobiledoc-kit/commit/81e1cb0))
* [CLEANUP] DRY copy/paste and drop event handling. Add editor#serializeTo ([8a1ae77](https://github.com/bustle/mobiledoc-kit/commit/8a1ae77))
* [FEATURE] holding shift while pasting pastes plain text ([a006366](https://github.com/bustle/mobiledoc-kit/commit/a006366)), closes [#334](https://github.com/bustle/mobiledoc-kit/issues/334)
* Add card with drag/drop listeners to demo app ([f374958](https://github.com/bustle/mobiledoc-kit/commit/f374958))
* Handle drop events semantically ([b2a49c9](https://github.com/bustle/mobiledoc-kit/commit/b2a49c9))
* Update README.md ([dad9dc3](https://github.com/bustle/mobiledoc-kit/commit/dad9dc3))
* v0.9.1 ([36a7d5e](https://github.com/bustle/mobiledoc-kit/commit/36a7d5e))
* chore(package): update testem to version 1.6.0 ([7117017](https://github.com/bustle/mobiledoc-kit/commit/7117017))



<a name="0.9.0"></a>
## 0.9.0 (2016-03-22)

* Ensure using arrow keys when text is selected moves cursor correctly ([58dec72](https://github.com/bustle/mobiledoc-kit/commit/58dec72))
* v0.9.0 ([67a8292](https://github.com/bustle/mobiledoc-kit/commit/67a8292))



<a name="0.9.0-beta.1"></a>
## 0.9.0-beta.1 (2016-03-17)

* Add ctrl+z, ctrl+shift+z key commands for non-mac ([8ad1377](https://github.com/bustle/mobiledoc-kit/commit/8ad1377))
* Add npm test:ci script, use mobiledoc-kit saucelabs creds ([e52172b](https://github.com/bustle/mobiledoc-kit/commit/e52172b))
* Add tests for copy-pasting on IE11. ([2a743fa](https://github.com/bustle/mobiledoc-kit/commit/2a743fa))
* Extract clipboard getters/setters into utility functions. ([f6307ea](https://github.com/bustle/mobiledoc-kit/commit/f6307ea))
* Fix a typo in Readme ([b20a76a](https://github.com/bustle/mobiledoc-kit/commit/b20a76a))
* Fix bug #326: Cross-browser testing on CI ([19874f8](https://github.com/bustle/mobiledoc-kit/commit/19874f8)), closes [#326](https://github.com/bustle/mobiledoc-kit/issues/326)
* Fix bug #329: Copy-pasting does not work on IE11 ([b4c46c3](https://github.com/bustle/mobiledoc-kit/commit/b4c46c3)), closes [#329](https://github.com/bustle/mobiledoc-kit/issues/329)
* Replace broken Node.contains with custom containsNode ([c80f5ad](https://github.com/bustle/mobiledoc-kit/commit/c80f5ad))
* Update changelog ([9e50f5b](https://github.com/bustle/mobiledoc-kit/commit/9e50f5b))
* update demo to use ember-mobiledoc-dom-renderer ^0.4.0 ([a1e7cf4](https://github.com/bustle/mobiledoc-kit/commit/a1e7cf4))
* update readme release instructions ([deb69f3](https://github.com/bustle/mobiledoc-kit/commit/deb69f3))
* Update README.md ([60b0b4f](https://github.com/bustle/mobiledoc-kit/commit/60b0b4f))
* Update README.md ([89a17ad](https://github.com/bustle/mobiledoc-kit/commit/89a17ad))
* Use keypress event to enter text ([2701e71](https://github.com/bustle/mobiledoc-kit/commit/2701e71))
* v0.9.0-beta.1 ([5768110](https://github.com/bustle/mobiledoc-kit/commit/5768110))
* chore(package): update dependencies ([b9bb08d](https://github.com/bustle/mobiledoc-kit/commit/b9bb08d))
* chore(package): update jquery to version 2.2.2 ([ce0a2c6](https://github.com/bustle/mobiledoc-kit/commit/ce0a2c6))
* chore(package): update testem to version 1.5.0 ([7a8eff8](https://github.com/bustle/mobiledoc-kit/commit/7a8eff8))



<a name="0.8.5"></a>
## <small>0.8.5 (2016-02-11)</small>

* 0.8.5 ([d062577](https://github.com/bustle/mobiledoc-kit/commit/d062577))
* bump to 0.8.5 ([037ff4a](https://github.com/bustle/mobiledoc-kit/commit/037ff4a))
* Expose version ([9a49660](https://github.com/bustle/mobiledoc-kit/commit/9a49660))
* Update changelog ([3a097cd](https://github.com/bustle/mobiledoc-kit/commit/3a097cd))



<a name="0.8.4"></a>
## <small>0.8.4 (2016-02-10)</small>

* 0.8.4 ([bc9da8b](https://github.com/bustle/mobiledoc-kit/commit/bc9da8b))
* Add further undo/redo tests ([2164ea5](https://github.com/bustle/mobiledoc-kit/commit/2164ea5))
* Do not permit changes inside cards to reparse ([7b5c272](https://github.com/bustle/mobiledoc-kit/commit/7b5c272))
* Update changelog ([e94e13f](https://github.com/bustle/mobiledoc-kit/commit/e94e13f))



<a name="0.8.3"></a>
## <small>0.8.3 (2016-02-10)</small>

* 0.8.2 ([b215e45](https://github.com/bustle/mobiledoc-kit/commit/b215e45))
* 0.8.3 ([75f117b](https://github.com/bustle/mobiledoc-kit/commit/75f117b))
* Add EditHistory, wire META+Z to undo last change ([5e6a3d5](https://github.com/bustle/mobiledoc-kit/commit/5e6a3d5)), closes [#149](https://github.com/bustle/mobiledoc-kit/issues/149)
* built website from 1d2b96df65db79a8e3a9debae0f98003fe43f84f ([81f94f1](https://github.com/bustle/mobiledoc-kit/commit/81f94f1))
* built website from 2a90e8a48c5dc9e0eeac16ea785adcd74060290e ([bd4093a](https://github.com/bustle/mobiledoc-kit/commit/bd4093a))
* built website from a3096f4ce144a5bb7df74f35a2067718a5158838 ([2a90e8a](https://github.com/bustle/mobiledoc-kit/commit/2a90e8a))
* Change "0.3" to "0.3.0" in MOBILEDOC.md ([a3096f4](https://github.com/bustle/mobiledoc-kit/commit/a3096f4))
* editor#serialize accepts version parameter ([e27bf9b](https://github.com/bustle/mobiledoc-kit/commit/e27bf9b))
* https URLs for placeholder ([1d2b96d](https://github.com/bustle/mobiledoc-kit/commit/1d2b96d))
* Migrate cursor API usage over to range ([b56aa16](https://github.com/bustle/mobiledoc-kit/commit/b56aa16))
* Update changelog ([2667468](https://github.com/bustle/mobiledoc-kit/commit/2667468))
* Update changelog ([4aeaedb](https://github.com/bustle/mobiledoc-kit/commit/4aeaedb))
* Update README.md ([6e972dd](https://github.com/bustle/mobiledoc-kit/commit/6e972dd))
* Update README.md ([94bb0a3](https://github.com/bustle/mobiledoc-kit/commit/94bb0a3))
* Use `node.contains` instead of checking element.parentNode in mutations ([ea9c849](https://github.com/bustle/mobiledoc-kit/commit/ea9c849))
* demo: use simple mobiledoc by default ([00e9388](https://github.com/bustle/mobiledoc-kit/commit/00e9388))



<a name="0.8.1"></a>
## <small>0.8.1 (2016-02-04)</small>

* 0.8.1 ([ee86120](https://github.com/bustle/mobiledoc-kit/commit/ee86120))
* built website from 35234813b8c468d118501e255c66b847e3048f90 ([ec8aaad](https://github.com/bustle/mobiledoc-kit/commit/ec8aaad))
* Update changelog ([3523481](https://github.com/bustle/mobiledoc-kit/commit/3523481))
* update dependencies for html and text renderers to ^0.3.0 ([144bfd3](https://github.com/bustle/mobiledoc-kit/commit/144bfd3))
* demo: update dependencies ([2a9d41f](https://github.com/bustle/mobiledoc-kit/commit/2a9d41f))



<a name="0.8.0"></a>
## 0.8.0 (2016-02-04)

* 0.8.0 ([07280ce](https://github.com/bustle/mobiledoc-kit/commit/07280ce))
* Atom deletion with keystrokes ([add705f](https://github.com/bustle/mobiledoc-kit/commit/add705f))
* Atoms should not be editable ([573453a](https://github.com/bustle/mobiledoc-kit/commit/573453a))
* Atoms with cursor movement, reparsing ([5020b91](https://github.com/bustle/mobiledoc-kit/commit/5020b91))
* Convert demo cards to 0.3.0 format, add an example Atom ([5b887b1](https://github.com/bustle/mobiledoc-kit/commit/5b887b1))
* Document and test insertMarkers for atoms ([e199416](https://github.com/bustle/mobiledoc-kit/commit/e199416))
* Don’t de-duplicate cards/atoms based on payload ([a831097](https://github.com/bustle/mobiledoc-kit/commit/a831097))
* Export the right version from 0.3 renderer ([cfbee1c](https://github.com/bustle/mobiledoc-kit/commit/cfbee1c))
* Hitting enter when atom is first in markupSection/listItem inserts newline ([1307b90](https://github.com/bustle/mobiledoc-kit/commit/1307b90)), closes [#313](https://github.com/bustle/mobiledoc-kit/issues/313)
* Implement Mobiledoc parser for v0.3.0 format ([2c32894](https://github.com/bustle/mobiledoc-kit/commit/2c32894))
* Implement Mobiledoc renderer v0.3 with atom support ([a9c2d80](https://github.com/bustle/mobiledoc-kit/commit/a9c2d80))
* Implement unknownAtomHandler & lifecycle hooks ([67e556a](https://github.com/bustle/mobiledoc-kit/commit/67e556a))
* Improve atom demos ([bc3fa94](https://github.com/bustle/mobiledoc-kit/commit/bc3fa94))
* Initial atoms and Mobiledoc 0.3 design ([0a51e71](https://github.com/bustle/mobiledoc-kit/commit/0a51e71))
* Initial atoms implementation ([11158e7](https://github.com/bustle/mobiledoc-kit/commit/11158e7))
* Keep track and use markupElement for marker when rendering/destroying ([b5eaff5](https://github.com/bustle/mobiledoc-kit/commit/b5eaff5)), closes [#306](https://github.com/bustle/mobiledoc-kit/issues/306) [#299](https://github.com/bustle/mobiledoc-kit/issues/299)
* Make Mobiledoc 0.3 the default version ([568eef6](https://github.com/bustle/mobiledoc-kit/commit/568eef6))
* Refined Atom behaviors wrt parsing, rerendering ([b5957a6](https://github.com/bustle/mobiledoc-kit/commit/b5957a6))
* restrict ctr-A and ctr-E key commands to Mac ([3684551](https://github.com/bustle/mobiledoc-kit/commit/3684551))
* Update ATOMS.md, MOBILEDOC.md ([3b063de](https://github.com/bustle/mobiledoc-kit/commit/3b063de))



<a name="0.8.0-beta.4"></a>
## 0.8.0-beta.4 (2016-01-28)

* 0.8.0-beta.4 ([08f37ac](https://github.com/bustle/mobiledoc-kit/commit/08f37ac))
* Add a demo card written in Ember ([6a1015e](https://github.com/bustle/mobiledoc-kit/commit/6a1015e))
* Add edit/save/cancel to Ember demo card ([6c4a43b](https://github.com/bustle/mobiledoc-kit/commit/6c4a43b))
* Add MutationHandler, reparse entire post when new nodes appear ([34ab629](https://github.com/bustle/mobiledoc-kit/commit/34ab629)), closes [#300](https://github.com/bustle/mobiledoc-kit/issues/300)
* built website from 3d34f06cadd5927e5cca8300297ffc80a08cd327 ([b86f015](https://github.com/bustle/mobiledoc-kit/commit/b86f015))
* built website from 445d075a8e891d8845480eebe5c95156ace05726 ([6498862](https://github.com/bustle/mobiledoc-kit/commit/6498862))
* Bump ember-mobiledoc-editor for fallback ember cards ([225fdaf](https://github.com/bustle/mobiledoc-kit/commit/225fdaf))
* cmd-K unlinks text if it already has a link in it ([6c50c1f](https://github.com/bustle/mobiledoc-kit/commit/6c50c1f)), closes [#295](https://github.com/bustle/mobiledoc-kit/issues/295)
* Drop dummy demo tests ([445d075](https://github.com/bustle/mobiledoc-kit/commit/445d075))
* handle spaces semantically ([fb093f7](https://github.com/bustle/mobiledoc-kit/commit/fb093f7)), closes [#292](https://github.com/bustle/mobiledoc-kit/issues/292)
* Make the font be secure-domain happy ([b7020fd](https://github.com/bustle/mobiledoc-kit/commit/b7020fd))
* Pass parser plugins to HTMLParser from editor#loadPost ([6b3da6e](https://github.com/bustle/mobiledoc-kit/commit/6b3da6e)), closes [#296](https://github.com/bustle/mobiledoc-kit/issues/296)
* Refactor cursor positioning ([af5ae91](https://github.com/bustle/mobiledoc-kit/commit/af5ae91))
* Remove editor#didReparse hook ([eda9a2b](https://github.com/bustle/mobiledoc-kit/commit/eda9a2b))
* Replace `throw Error` usage with `assert`, use custom `MobiledocError` ([ea09b52](https://github.com/bustle/mobiledoc-kit/commit/ea09b52))
* Report active markups even when selection is collapsed ([b85724e](https://github.com/bustle/mobiledoc-kit/commit/b85724e))
* Satisfy newer jshint ([2eba3b5](https://github.com/bustle/mobiledoc-kit/commit/2eba3b5))
* Skip all non-text, non-element nodes in SectionParser ([4d5b4d2](https://github.com/bustle/mobiledoc-kit/commit/4d5b4d2))
* Suggest secure domain for selfie card ([c4966fd](https://github.com/bustle/mobiledoc-kit/commit/c4966fd))



<a name="0.8.0-beta.3"></a>
## 0.8.0-beta.3 (2016-01-11)

* Always `setRange` in `toggleMarkup` and `toggleSection` ([5ae07ee](https://github.com/bustle/mobiledoc-kit/commit/5ae07ee)), closes [#285](https://github.com/bustle/mobiledoc-kit/issues/285) [#287](https://github.com/bustle/mobiledoc-kit/issues/287)
* v0.8.0-beta.3 ([819085b](https://github.com/bustle/mobiledoc-kit/commit/819085b))



<a name="0.8.0-beta.2"></a>
## 0.8.0-beta.2 (2016-01-11)

* Expose Mobiledoc.Range ([c4aebef](https://github.com/bustle/mobiledoc-kit/commit/c4aebef))
* Refactor postEditor#insertText to use #insertMarkers ([33e6bf0](https://github.com/bustle/mobiledoc-kit/commit/33e6bf0))
* Update changelog ([95acc75](https://github.com/bustle/mobiledoc-kit/commit/95acc75))
* v0.8.0-beta.2 ([2cf1ff8](https://github.com/bustle/mobiledoc-kit/commit/2cf1ff8))



<a name="0.8.0-beta.1"></a>
## 0.8.0-beta.1 (2016-01-07)

* 0.8.0-beta.1 ([704bb20](https://github.com/bustle/mobiledoc-kit/commit/704bb20))
* Blur element focus on destroy, add null/blank demos ([845c041](https://github.com/bustle/mobiledoc-kit/commit/845c041))
* Fix bug #276: Copy-pasting from Google Docs and Sheets does not work on Chrome on Windows ([b3aac9e](https://github.com/bustle/mobiledoc-kit/commit/b3aac9e)), closes [#276](https://github.com/bustle/mobiledoc-kit/issues/276)
* marker#deleteValueAtOffset detects if the character is outside the BMP ([f3b72ae](https://github.com/bustle/mobiledoc-kit/commit/f3b72ae)), closes [#274](https://github.com/bustle/mobiledoc-kit/issues/274)
* only find text expansion when at end of markup section ([9c3fa90](https://github.com/bustle/mobiledoc-kit/commit/9c3fa90)), closes [#280](https://github.com/bustle/mobiledoc-kit/issues/280)
* Remove content-kit-utils, move mobiledoc renderers to dependencies ([a625f7a](https://github.com/bustle/mobiledoc-kit/commit/a625f7a)), closes [#278](https://github.com/bustle/mobiledoc-kit/issues/278)
* Update changelog ([8f83e6d](https://github.com/bustle/mobiledoc-kit/commit/8f83e6d))



<a name="0.7.3"></a>
## <small>0.7.3 (2015-12-17)</small>

* 0.7.3 ([45b3b87](https://github.com/bustle/mobiledoc-kit/commit/45b3b87))
* Add text parser, use it for handling pasted text ([c3e2ffd](https://github.com/bustle/mobiledoc-kit/commit/c3e2ffd)), closes [#263](https://github.com/bustle/mobiledoc-kit/issues/263)
* built website from 94507c9f49d15caa600469752480d6ea3ff4aa96 ([76b01fb](https://github.com/bustle/mobiledoc-kit/commit/76b01fb))
* Clear selection in editor#destroy, make editorDomRenderer#destroy safer ([15ceb0f](https://github.com/bustle/mobiledoc-kit/commit/15ceb0f))
* ensure style tags are skipped when parsing HTML/dom ([5409b1a](https://github.com/bustle/mobiledoc-kit/commit/5409b1a))
* Refactor Position#move to work correctly when prev/next is list section ([3c73d86](https://github.com/bustle/mobiledoc-kit/commit/3c73d86)), closes [#270](https://github.com/bustle/mobiledoc-kit/issues/270)
* Refactor postEditor#insertPost to handle more situations ([cda1e7e](https://github.com/bustle/mobiledoc-kit/commit/cda1e7e)), closes [#249](https://github.com/bustle/mobiledoc-kit/issues/249) [#259](https://github.com/bustle/mobiledoc-kit/issues/259)
* Tweak changelog ([94507c9](https://github.com/bustle/mobiledoc-kit/commit/94507c9))
* Update changelog ([ed299a7](https://github.com/bustle/mobiledoc-kit/commit/ed299a7))



<a name="0.7.2"></a>
## <small>0.7.2 (2015-12-14)</small>

* 0.7.2 ([fc25f1d](https://github.com/bustle/mobiledoc-kit/commit/fc25f1d))
* Avoid reparse after initial render ([a30897b](https://github.com/bustle/mobiledoc-kit/commit/a30897b))
* built website from ea57d2f4ae42f7e855d44bb9f4e6690b6fe621d1 ([abf204a](https://github.com/bustle/mobiledoc-kit/commit/abf204a))
* Catch, display and log rendering errors ([ce06ef3](https://github.com/bustle/mobiledoc-kit/commit/ce06ef3))
* Clean up changelog ([eaaed00](https://github.com/bustle/mobiledoc-kit/commit/eaaed00))
* Drop mutation observer during rerender ([26d3d78](https://github.com/bustle/mobiledoc-kit/commit/26d3d78))
* Fix issue #256:  Copy-pasting from Notepad does not work ([e251455](https://github.com/bustle/mobiledoc-kit/commit/e251455)), closes [#256](https://github.com/bustle/mobiledoc-kit/issues/256)
* Optimize the compiler loop ([eeca363](https://github.com/bustle/mobiledoc-kit/commit/eeca363))
* Set cursor to collapsed after hitting enter ([68cfa16](https://github.com/bustle/mobiledoc-kit/commit/68cfa16))
* Update changelog ([ea57d2f](https://github.com/bustle/mobiledoc-kit/commit/ea57d2f))



<a name="0.7.1"></a>
## <small>0.7.1 (2015-12-09)</small>

* 0.7.1 ([49dafd8](https://github.com/bustle/mobiledoc-kit/commit/49dafd8))
* Add better guard against inserting item from other list into linked list ([f7a4ef2](https://github.com/bustle/mobiledoc-kit/commit/f7a4ef2))
* Add postEditor#toggleSection, works with ul/ol sections ([1e47433](https://github.com/bustle/mobiledoc-kit/commit/1e47433)), closes [#186](https://github.com/bustle/mobiledoc-kit/issues/186)
* Add support for tabs ([a677599](https://github.com/bustle/mobiledoc-kit/commit/a677599))
* built website from 4a39224e72873b155d12e922865b5e9d426ea8c4 ([5c890e2](https://github.com/bustle/mobiledoc-kit/commit/5c890e2))
* Document parser hooks ([06b1406](https://github.com/bustle/mobiledoc-kit/commit/06b1406))
* IE11 Support ([3eeb2ba](https://github.com/bustle/mobiledoc-kit/commit/3eeb2ba))
* Implement parserPlugins API ([f52d97e](https://github.com/bustle/mobiledoc-kit/commit/f52d97e))
* Update changelog ([a72fe64](https://github.com/bustle/mobiledoc-kit/commit/a72fe64))
* update outdated modules (used updtr) ([0c5f102](https://github.com/bustle/mobiledoc-kit/commit/0c5f102))
* Use '__mobiledoc-' prefix for element class names ([10eb490](https://github.com/bustle/mobiledoc-kit/commit/10eb490))
* use ember-mobiledoc-editor v0.3.0 ([4a39224](https://github.com/bustle/mobiledoc-kit/commit/4a39224))



<a name="0.7.0"></a>
## 0.7.0 (2015-11-24)

* 0.7.0 ([afbeb5e](https://github.com/bustle/mobiledoc-kit/commit/afbeb5e))
* update card docs ([5b87106](https://github.com/bustle/mobiledoc-kit/commit/5b87106))
* Use ember-mobiledoc-editor@0.2.2-beta1 ([bd83fc5](https://github.com/bustle/mobiledoc-kit/commit/bd83fc5))



<a name="0.6.2-beta1"></a>
## <small>0.6.2-beta1 (2015-11-23)</small>

* Add versioning for Mobiledoc renderer, parser ([69a93e4](https://github.com/bustle/mobiledoc-kit/commit/69a93e4))
* Fix DOM-dependent tests for IE Edge ([49bc53d](https://github.com/bustle/mobiledoc-kit/commit/49bc53d))
* Fix un-executed tests ([d4ce7b9](https://github.com/bustle/mobiledoc-kit/commit/d4ce7b9))
* Implement card refactor for editor-dom renderer ([3baafbe](https://github.com/bustle/mobiledoc-kit/commit/3baafbe)), closes [#236](https://github.com/bustle/mobiledoc-kit/issues/236) [#239](https://github.com/bustle/mobiledoc-kit/issues/239)
* Silence testing-only failues on IE Edge ([0dc9ec6](https://github.com/bustle/mobiledoc-kit/commit/0dc9ec6))
* Update changelog ([915a287](https://github.com/bustle/mobiledoc-kit/commit/915a287))
* Use more constants for mobiledoc versions ([2d1b59f](https://github.com/bustle/mobiledoc-kit/commit/2d1b59f))
* v0.6.2-beta1 ([ebdd180](https://github.com/bustle/mobiledoc-kit/commit/ebdd180))



<a name="0.6.1"></a>
## <small>0.6.1 (2015-11-18)</small>

* 0.6.1 ([ff637c1](https://github.com/bustle/mobiledoc-kit/commit/ff637c1))
* Retain edit mode on cloned cards ([ebe19b8](https://github.com/bustle/mobiledoc-kit/commit/ebe19b8))



<a name="0.6.0"></a>
## 0.6.0 (2015-11-16)

* 0.6.0 ([0001015](https://github.com/bustle/mobiledoc-kit/commit/0001015))
* Add `update-changelog` npm script, update readme ([29e5278](https://github.com/bustle/mobiledoc-kit/commit/29e5278))
* add changelog ([1aa18a6](https://github.com/bustle/mobiledoc-kit/commit/1aa18a6))
* add logo to demo assets ([45e3b42](https://github.com/bustle/mobiledoc-kit/commit/45e3b42))
* Add mobiledoc logo ([88e9902](https://github.com/bustle/mobiledoc-kit/commit/88e9902))
* Add select option for codemirror card ([208f09d](https://github.com/bustle/mobiledoc-kit/commit/208f09d))
* add small logo ([76f8e6e](https://github.com/bustle/mobiledoc-kit/commit/76f8e6e))
* built website from 45e3b42b562ded870fe99c62af2918cbe55c3694 ([0937781](https://github.com/bustle/mobiledoc-kit/commit/0937781))
* Fix project in a link ([e7bcab2](https://github.com/bustle/mobiledoc-kit/commit/e7bcab2))
* Update demo for mobiledoc 0.2.0-beta ([e078eeb](https://github.com/bustle/mobiledoc-kit/commit/e078eeb))
* Update demos, add different renderers ([1d9b124](https://github.com/bustle/mobiledoc-kit/commit/1d9b124))
* Update links to mobiledoc renderers ([d5d573e](https://github.com/bustle/mobiledoc-kit/commit/d5d573e))
* update website build/deploy script messages ([34beec1](https://github.com/bustle/mobiledoc-kit/commit/34beec1))
* Use ember-mobiledoc-*-renderer addons ([a7f5940](https://github.com/bustle/mobiledoc-kit/commit/a7f5940))
* use ember-mobiledoc-dom-renderer ([fb8fd2d](https://github.com/bustle/mobiledoc-kit/commit/fb8fd2d))
* Use html and text mobiledoc renderers for copy/paste ([6a1bbf7](https://github.com/bustle/mobiledoc-kit/commit/6a1bbf7)), closes [#205](https://github.com/bustle/mobiledoc-kit/issues/205)



<a name="0.6.0-beta4"></a>
## 0.6.0-beta4 (2015-11-10)

* 0.6.0-beta4 ([ec3b07e](https://github.com/bustle/mobiledoc-kit/commit/ec3b07e))
* Drop inCard, broke null section positions ([2300311](https://github.com/bustle/mobiledoc-kit/commit/2300311))



<a name="0.6.0-beta2"></a>
## 0.6.0-beta2 (2015-11-10)

* 0.6.0-beta2 ([a1d1df0](https://github.com/bustle/mobiledoc-kit/commit/a1d1df0))
* Correct version: 0.6.0-beta1 ([532635e](https://github.com/bustle/mobiledoc-kit/commit/532635e))



<a name="0.6.0-beta1"></a>
## 0.6.0-beta1 (2015-11-10)

* 0.6.0-beta.1 ([13f5193](https://github.com/bustle/mobiledoc-kit/commit/13f5193))
* Content-Kit -> Mobiledoc Kit ([a3d31f6](https://github.com/bustle/mobiledoc-kit/commit/a3d31f6))
* Correctly interpret a reported selection of the editor element ([937f359](https://github.com/bustle/mobiledoc-kit/commit/937f359)), closes [#215](https://github.com/bustle/mobiledoc-kit/issues/215)
* Match key commands to modifiers exactly ([8d2b95d](https://github.com/bustle/mobiledoc-kit/commit/8d2b95d)), closes [#216](https://github.com/bustle/mobiledoc-kit/issues/216)
* Update Travis Badge in README ([aef72ba](https://github.com/bustle/mobiledoc-kit/commit/aef72ba))



<a name="0.5.1"></a>
## <small>0.5.1 (2015-11-09)</small>

* 0.5.1 ([132cf33](https://github.com/bustle/mobiledoc-kit/commit/132cf33))
* Add cursor points at head and tail of cards ([ac4fac8](https://github.com/bustle/mobiledoc-kit/commit/ac4fac8)), closes [#182](https://github.com/bustle/mobiledoc-kit/issues/182)
* Add underline, subscript, superscript and strikethrough markup ([cae444c](https://github.com/bustle/mobiledoc-kit/commit/cae444c))
* demo card with image ([2a7753a](https://github.com/bustle/mobiledoc-kit/commit/2a7753a))
* fix createMarkup() example in post.js ([336ee8a](https://github.com/bustle/mobiledoc-kit/commit/336ee8a))
* Fix demo input card for FF ([f6563f8](https://github.com/bustle/mobiledoc-kit/commit/f6563f8))
* fix typo in Editor Lifecycle Hooks section of README ([193007c](https://github.com/bustle/mobiledoc-kit/commit/193007c))
* Parse nbsp into spaces, render nbsp where needed ([6a95af5](https://github.com/bustle/mobiledoc-kit/commit/6a95af5)), closes [#195](https://github.com/bustle/mobiledoc-kit/issues/195)
* Remove Post parser, its reparse methods are  now in DOM parser ([cf45846](https://github.com/bustle/mobiledoc-kit/commit/cf45846))
* Remove unused/deprecated code and css ([2f5eb4a](https://github.com/bustle/mobiledoc-kit/commit/2f5eb4a))
* show text cursor instead of default cursor over the placeholder ([f7db993](https://github.com/bustle/mobiledoc-kit/commit/f7db993))



<a name="0.5.0"></a>
## 0.5.0 (2015-11-02)

* 0.5.0 ([c7340f2](https://github.com/bustle/mobiledoc-kit/commit/c7340f2))
* Better error messages when parsing bad mobiledoc ([7d67671](https://github.com/bustle/mobiledoc-kit/commit/7d67671)), closes [#177](https://github.com/bustle/mobiledoc-kit/issues/177)
* built website from 7774864980b6944edd755346044ff13f730fa299 ([e0b7e0e](https://github.com/bustle/mobiledoc-kit/commit/e0b7e0e))
* built website from e0b7e0e0bf8326a7e56d8a2eed7052bc64e525cd ([28c57d7](https://github.com/bustle/mobiledoc-kit/commit/28c57d7))
* Enable pasting html and text externally ([3556155](https://github.com/bustle/mobiledoc-kit/commit/3556155)), closes [#180](https://github.com/bustle/mobiledoc-kit/issues/180)
* Paste improvements ([d4ce47a](https://github.com/bustle/mobiledoc-kit/commit/d4ce47a)), closes [#196](https://github.com/bustle/mobiledoc-kit/issues/196) [#190](https://github.com/bustle/mobiledoc-kit/issues/190)
* Remove unused files, remove packages from package.json, docs ([fce0dc4](https://github.com/bustle/mobiledoc-kit/commit/fce0dc4))
* update website build script, demo prod config ([7fbd438](https://github.com/bustle/mobiledoc-kit/commit/7fbd438))



<a name="0.5.0-beta2"></a>
## 0.5.0-beta2 (2015-10-27)

* 0.5.0-beta2 ([ff395b6](https://github.com/bustle/mobiledoc-kit/commit/ff395b6))
* Improve unknown card errors ([180172e](https://github.com/bustle/mobiledoc-kit/commit/180172e))
* Parse ul and ols correctly ([577b3db](https://github.com/bustle/mobiledoc-kit/commit/577b3db)), closes [#183](https://github.com/bustle/mobiledoc-kit/issues/183)
* Return "moved" sections ([5371529](https://github.com/bustle/mobiledoc-kit/commit/5371529))



<a name="0.5.0-beta1"></a>
## 0.5.0-beta1 (2015-10-27)

* 0.5.0-beta1 ([4b1179a](https://github.com/bustle/mobiledoc-kit/commit/4b1179a))
* Add `cardParsers` to SectionParser ([1c880f3](https://github.com/bustle/mobiledoc-kit/commit/1c880f3))
* Enable CommonJS builds ([ad2e698](https://github.com/bustle/mobiledoc-kit/commit/ad2e698)), closes [#181](https://github.com/bustle/mobiledoc-kit/issues/181)
* Fix demo updating on selection change ([051d267](https://github.com/bustle/mobiledoc-kit/commit/051d267))
* Update demo. Style active buttons, bump ember-content-kit ([8e3dde4](https://github.com/bustle/mobiledoc-kit/commit/8e3dde4))



<a name="0.4.11"></a>
## <small>0.4.11 (2015-10-23)</small>

* 0.4.11 ([2f4f1b6](https://github.com/bustle/mobiledoc-kit/commit/2f4f1b6))
* Delete selection before applying paste ([ee22762](https://github.com/bustle/mobiledoc-kit/commit/ee22762)), closes [#184](https://github.com/bustle/mobiledoc-kit/issues/184)



<a name="0.4.10"></a>
## <small>0.4.10 (2015-10-22)</small>

* 0.4.10 ([b1080ae](https://github.com/bustle/mobiledoc-kit/commit/b1080ae))
* execCommands for bold, italic without selection ([8855461](https://github.com/bustle/mobiledoc-kit/commit/8855461))
* Handle cut/copy/paste events ([c2bbafe](https://github.com/bustle/mobiledoc-kit/commit/c2bbafe)), closes [#180](https://github.com/bustle/mobiledoc-kit/issues/180) [#111](https://github.com/bustle/mobiledoc-kit/issues/111)



<a name="0.4.9"></a>
## <small>0.4.9 (2015-10-20)</small>

* 0.4.9 ([b76155b](https://github.com/bustle/mobiledoc-kit/commit/b76155b))
* Remove dragover, drop listeners ([29db470](https://github.com/bustle/mobiledoc-kit/commit/29db470))



<a name="0.4.8"></a>
## <small>0.4.8 (2015-10-16)</small>

* 0.4.8 ([e069b2e](https://github.com/bustle/mobiledoc-kit/commit/e069b2e))
* Allow silent payload saving ([f041963](https://github.com/bustle/mobiledoc-kit/commit/f041963))
* Drop the embed intent prompt ([edf3c26](https://github.com/bustle/mobiledoc-kit/commit/edf3c26))



<a name="0.4.7"></a>
## <small>0.4.7 (2015-10-15)</small>

* 0.4.7 ([ac3e6c5](https://github.com/bustle/mobiledoc-kit/commit/ac3e6c5))
* Add editor#editCard and editor#displayCard ([2ef19f1](https://github.com/bustle/mobiledoc-kit/commit/2ef19f1))
* Allow duplicate key commands to be registered ([0140bd9](https://github.com/bustle/mobiledoc-kit/commit/0140bd9))
* built website from 0be1a85e810ef8c3f943b8dbb552dfd8faeed0a0 ([1c68846](https://github.com/bustle/mobiledoc-kit/commit/1c68846))
* Fix bug when walkMarkerableSections ranges starts with card ([9d6266c](https://github.com/bustle/mobiledoc-kit/commit/9d6266c))
* fixes shiftKey not being detected ([9d515e9](https://github.com/bustle/mobiledoc-kit/commit/9d515e9))
* Initial display of mobiledoc and rendered DOM ([7761ecc](https://github.com/bustle/mobiledoc-kit/commit/7761ecc)), closes [#163](https://github.com/bustle/mobiledoc-kit/issues/163)
* Register combo commands (“CTRL+X”) and allow special key names (“enter”) ([f6cfe26](https://github.com/bustle/mobiledoc-kit/commit/f6cfe26))
* Registered key commands can override built-in functionality ([cbd6ec0](https://github.com/bustle/mobiledoc-kit/commit/cbd6ec0))
* update README with details of key commands ([d3228b7](https://github.com/bustle/mobiledoc-kit/commit/d3228b7))
* Update website build script for Ember ([0be1a85](https://github.com/bustle/mobiledoc-kit/commit/0be1a85))



<a name="0.4.6"></a>
## <small>0.4.6 (2015-10-01)</small>

* 0.4.6 ([cad7039](https://github.com/bustle/mobiledoc-kit/commit/cad7039))
* Drop toolbars, migrate to Ember based demo ([bd63658](https://github.com/bustle/mobiledoc-kit/commit/bd63658))



<a name="0.4.5"></a>
## <small>0.4.5 (2015-09-24)</small>

* 0.4.5 ([e738b32](https://github.com/bustle/mobiledoc-kit/commit/e738b32))
* Drop addon ([9c775ff](https://github.com/bustle/mobiledoc-kit/commit/9c775ff))



<a name="0.4.4"></a>
## <small>0.4.4 (2015-09-23)</small>

* 0.4.4 ([973a1a2](https://github.com/bustle/mobiledoc-kit/commit/973a1a2))
* refactor post editor to use callbacks ([b53ae7a](https://github.com/bustle/mobiledoc-kit/commit/b53ae7a))
* section#clone, postEditor#moveSectionBefore moveSectionUp moveSectionDown ([099bc21](https://github.com/bustle/mobiledoc-kit/commit/099bc21))



<a name="0.4.3"></a>
## <small>0.4.3 (2015-09-23)</small>

* 0.4.3 ([de3113d](https://github.com/bustle/mobiledoc-kit/commit/de3113d))
* Add #detectMarkupInRange to editor ([93824a1](https://github.com/bustle/mobiledoc-kit/commit/93824a1))
* applyMarkupToRange -> addMarkupToRange ([ded780b](https://github.com/bustle/mobiledoc-kit/commit/ded780b))



<a name="0.4.2"></a>
## <small>0.4.2 (2015-09-22)</small>

* 0.4.2 ([2a689a5](https://github.com/bustle/mobiledoc-kit/commit/2a689a5))
* Add `cursorDidChange` lifecycle callback to editor ([cb20368](https://github.com/bustle/mobiledoc-kit/commit/cb20368)), closes [#157](https://github.com/bustle/mobiledoc-kit/issues/157)
* Handle a section of tagName "pull-quote" ([216cd9b](https://github.com/bustle/mobiledoc-kit/commit/216cd9b)), closes [#153](https://github.com/bustle/mobiledoc-kit/issues/153)
* Handle selecting sections when the passed array is empty ([f249a74](https://github.com/bustle/mobiledoc-kit/commit/f249a74)), closes [#155](https://github.com/bustle/mobiledoc-kit/issues/155)
* Update README.md ([5579169](https://github.com/bustle/mobiledoc-kit/commit/5579169))



<a name="0.4.1"></a>
## <small>0.4.1 (2015-09-21)</small>

* 0.4.1 ([0dd2d4c](https://github.com/bustle/mobiledoc-kit/commit/0dd2d4c))
* Add docs for `registerKeyCommand` and `registerExpansion` editor methods ([a2df75e](https://github.com/bustle/mobiledoc-kit/commit/a2df75e)), closes [#150](https://github.com/bustle/mobiledoc-kit/issues/150)
* built website from 4e4662cf0315fd4c235d798a78857343be730bbc ([db764c6](https://github.com/bustle/mobiledoc-kit/commit/db764c6))
* upgrade to broccoli-multi-builder 0.2.8 ([ab5029e](https://github.com/bustle/mobiledoc-kit/commit/ab5029e))



<a name="0.4.0"></a>
## 0.4.0 (2015-09-21)

* 0.4.0 ([4e4662c](https://github.com/bustle/mobiledoc-kit/commit/4e4662c))
* add postEditor#splitSectionMarkerAtOffset ([6940ecd](https://github.com/bustle/mobiledoc-kit/commit/6940ecd))
* Coalesce markers that have identical markups ([a83b176](https://github.com/bustle/mobiledoc-kit/commit/a83b176))
* Fix all failing tests on Firefox ([e5b4763](https://github.com/bustle/mobiledoc-kit/commit/e5b4763))
* fix firefox demo ([9c02250](https://github.com/bustle/mobiledoc-kit/commit/9c02250))
* mark marker as dirty, not section, when applying or removing markup ([7d91956](https://github.com/bustle/mobiledoc-kit/commit/7d91956))
* No need to coalesce markers for removed sections ([af39a5a](https://github.com/bustle/mobiledoc-kit/commit/af39a5a))
* Use postEditor for block format commands ([0e4befd](https://github.com/bustle/mobiledoc-kit/commit/0e4befd))



<a name="0.3.13"></a>
## <small>0.3.13 (2015-09-16)</small>

* 0.3.13 ([0eb505b](https://github.com/bustle/mobiledoc-kit/commit/0eb505b))
* Add postEditor#insertSection, #insertSectionAtEnd, #toggleMarkup ([5dffae5](https://github.com/bustle/mobiledoc-kit/commit/5dffae5)), closes [#126](https://github.com/bustle/mobiledoc-kit/issues/126)
* Do not show embed intent when editing is disabled ([0f18698](https://github.com/bustle/mobiledoc-kit/commit/0f18698)), closes [#129](https://github.com/bustle/mobiledoc-kit/issues/129)
* Do not show the placeholder text when editing is disabled ([03e404c](https://github.com/bustle/mobiledoc-kit/commit/03e404c))
* Ensure that a markup can be applied to a range with a blank section ([7614af4](https://github.com/bustle/mobiledoc-kit/commit/7614af4)), closes [#128](https://github.com/bustle/mobiledoc-kit/issues/128)
* ensure we cache markups with attributes properly ([a46c26e](https://github.com/bustle/mobiledoc-kit/commit/a46c26e)), closes [#140](https://github.com/bustle/mobiledoc-kit/issues/140)
* Failing test for #134 ([db4c922](https://github.com/bustle/mobiledoc-kit/commit/db4c922)), closes [#134](https://github.com/bustle/mobiledoc-kit/issues/134)
* post#sectionsContainedBy returns [] when head section === tail section ([0a9fc7b](https://github.com/bustle/mobiledoc-kit/commit/0a9fc7b)), closes [#134](https://github.com/bustle/mobiledoc-kit/issues/134)
* Refactor EditorDom Renderer to ensure renderNodes are not leaked ([0b8f6c8](https://github.com/bustle/mobiledoc-kit/commit/0b8f6c8)), closes [#132](https://github.com/bustle/mobiledoc-kit/issues/132)
* Set the renderTree renderNode element for a list item ([7c192ed](https://github.com/bustle/mobiledoc-kit/commit/7c192ed)), closes [#130](https://github.com/bustle/mobiledoc-kit/issues/130)
* update release notes ([411ea90](https://github.com/bustle/mobiledoc-kit/commit/411ea90))
* use `isBlank` in editor-dom renderer ([542e672](https://github.com/bustle/mobiledoc-kit/commit/542e672))



<a name="0.3.12"></a>
## <small>0.3.12 (2015-09-15)</small>

* 0.3.12 ([d3ecb8d](https://github.com/bustle/mobiledoc-kit/commit/d3ecb8d))
* built website from 068db51a82c6c3d75ca9a5ef18a25e3d3fdc1db6 ([fa4c06c](https://github.com/bustle/mobiledoc-kit/commit/fa4c06c))
* Handle blank mobiledoc in editor ([dca9722](https://github.com/bustle/mobiledoc-kit/commit/dca9722)), closes [#125](https://github.com/bustle/mobiledoc-kit/issues/125) [#35](https://github.com/bustle/mobiledoc-kit/issues/35) [#71](https://github.com/bustle/mobiledoc-kit/issues/71)
* Handle forward-delete in list items ([ae42ab2](https://github.com/bustle/mobiledoc-kit/commit/ae42ab2)), closes [#118](https://github.com/bustle/mobiledoc-kit/issues/118)
* Refactor dom helpers, run some tests that were skipped in phantom ([e19dd6c](https://github.com/bustle/mobiledoc-kit/commit/e19dd6c))
* Refactor into base Section class ([a8e19da](https://github.com/bustle/mobiledoc-kit/commit/a8e19da))
* simplify Helpers.dom.getSelectedText() ([352c53c](https://github.com/bustle/mobiledoc-kit/commit/352c53c))



<a name="0.3.11"></a>
## <small>0.3.11 (2015-09-10)</small>

* 0.3.11 ([31f4b7a](https://github.com/bustle/mobiledoc-kit/commit/31f4b7a))
* Add keyboard shortcuts via editor#registerKeyCommand ([f5487b0](https://github.com/bustle/mobiledoc-kit/commit/f5487b0)), closes [#112](https://github.com/bustle/mobiledoc-kit/issues/112)
* Fix bug in getting activeMarkers, use editor#markupsInSelection ([1c2fbab](https://github.com/bustle/mobiledoc-kit/commit/1c2fbab)), closes [#119](https://github.com/bustle/mobiledoc-kit/issues/119)
* Fix joining of previous section in postEditor when prev section is list ([fedb727](https://github.com/bustle/mobiledoc-kit/commit/fedb727)), closes [#117](https://github.com/bustle/mobiledoc-kit/issues/117)
* Move command and button creation code out of editor.js ([fe72d5b](https://github.com/bustle/mobiledoc-kit/commit/fe72d5b))
* Use post#markersContainedByRange in postEditor#splitMarkers ([63cb72a](https://github.com/bustle/mobiledoc-kit/commit/63cb72a)), closes [#121](https://github.com/bustle/mobiledoc-kit/issues/121)



<a name="0.3.10"></a>
## <small>0.3.10 (2015-09-08)</small>

* 0.3.10 ([a5b6b50](https://github.com/bustle/mobiledoc-kit/commit/a5b6b50))
* Add Post#sectionsContainedBy and update #walkMarkerableSections ([703ce12](https://github.com/bustle/mobiledoc-kit/commit/703ce12)), closes [#108](https://github.com/bustle/mobiledoc-kit/issues/108)
* Add post#walkMarkerableSections and make post.markersFor markerable-aware ([4b2ca18](https://github.com/bustle/mobiledoc-kit/commit/4b2ca18)), closes [#102](https://github.com/bustle/mobiledoc-kit/issues/102)
* bump mobiledoc-html-renderer dep ([58714d6](https://github.com/bustle/mobiledoc-kit/commit/58714d6))
* bump to use mobiledoc-dom-renderer 0.1.12, with list support ([41e0605](https://github.com/bustle/mobiledoc-kit/commit/41e0605))
* Cleanup listener code ([3d56c76](https://github.com/bustle/mobiledoc-kit/commit/3d56c76))
* Create default markup section when hitting enter ([d348d06](https://github.com/bustle/mobiledoc-kit/commit/d348d06))
* Detect when cursor is in card and ignore editor event listeners when so ([e6bfdef](https://github.com/bustle/mobiledoc-kit/commit/e6bfdef)), closes [#114](https://github.com/bustle/mobiledoc-kit/issues/114)
* Implement text expansions ([f598db8](https://github.com/bustle/mobiledoc-kit/commit/f598db8)), closes [#87](https://github.com/bustle/mobiledoc-kit/issues/87)
* Remove extraneous arguments in toolbar/view logic ([f5871fc](https://github.com/bustle/mobiledoc-kit/commit/f5871fc))
* Remove unnecessary `sync` call ([413144b](https://github.com/bustle/mobiledoc-kit/commit/413144b))
* Simplify card editor-dom rendering ([a2a9969](https://github.com/bustle/mobiledoc-kit/commit/a2a9969))



<a name="0.3.9"></a>
## <small>0.3.9 (2015-09-01)</small>

* 0.3.9 ([b3d9cdb](https://github.com/bustle/mobiledoc-kit/commit/b3d9cdb))
* Add #remove env hook to cards ([0787c17](https://github.com/bustle/mobiledoc-kit/commit/0787c17)), closes [#104](https://github.com/bustle/mobiledoc-kit/issues/104)
* Add ListSection, ListItem, bump MOBILEDOC_VERSION -> 0.2.0 ([44494f0](https://github.com/bustle/mobiledoc-kit/commit/44494f0))
* Add prompt button, remove execCommand for links ([dcab0ad](https://github.com/bustle/mobiledoc-kit/commit/dcab0ad)), closes [#98](https://github.com/bustle/mobiledoc-kit/issues/98)
* allow trailing commas ([04cfdc7](https://github.com/bustle/mobiledoc-kit/commit/04cfdc7))
* Catch render errors in demo and display the error ([789e252](https://github.com/bustle/mobiledoc-kit/commit/789e252))
* Cleanup ([9fa15e4](https://github.com/bustle/mobiledoc-kit/commit/9fa15e4))
* Drop all blank markers, section renders br ([787bd5a](https://github.com/bustle/mobiledoc-kit/commit/787bd5a))
* Ensure we correctly use the markup cache when creating markups ([72cb5c6](https://github.com/bustle/mobiledoc-kit/commit/72cb5c6)), closes [#80](https://github.com/bustle/mobiledoc-kit/issues/80)
* Extract Markerable base class for ListItem and MarkupSection ([cab841a](https://github.com/bustle/mobiledoc-kit/commit/cab841a))
* Introduce lifecycle hooks ([34104aa](https://github.com/bustle/mobiledoc-kit/commit/34104aa))



<a name="0.3.8"></a>
## <small>0.3.8 (2015-08-26)</small>

* 0.3.8 ([6f18a98](https://github.com/bustle/mobiledoc-kit/commit/6f18a98))
* Fix clicking when there is no active cursor. ([48d372e](https://github.com/bustle/mobiledoc-kit/commit/48d372e))



<a name="0.3.7"></a>
## <small>0.3.7 (2015-08-25)</small>

* 0.3.7 ([7d93666](https://github.com/bustle/mobiledoc-kit/commit/7d93666))
* built website from ced3b2b9e50e8a1c4be251e645a34a013135854f ([785641b](https://github.com/bustle/mobiledoc-kit/commit/785641b))
* disabling content editable works before render ([3a2c416](https://github.com/bustle/mobiledoc-kit/commit/3a2c416))
* Ensure that editor gets destroyed between tests ([b1d58d1](https://github.com/bustle/mobiledoc-kit/commit/b1d58d1))



<a name="0.3.6"></a>
## <small>0.3.6 (2015-08-25)</small>

* 0.3.5 ([c8aa07e](https://github.com/bustle/mobiledoc-kit/commit/c8aa07e))
* 0.3.6 ([ced3b2b](https://github.com/bustle/mobiledoc-kit/commit/ced3b2b))
* Add disableEditing, enableEditing ([22f723f](https://github.com/bustle/mobiledoc-kit/commit/22f723f))
* built website from c83010e40c0ca020d10ce9ffa97044fcac435ca0 ([25ec47e](https://github.com/bustle/mobiledoc-kit/commit/25ec47e))
* Remove UNPRINTABLE_CHARACTER, use <br> instead ([a0d5566](https://github.com/bustle/mobiledoc-kit/commit/a0d5566))
* simplify #markersFor ([ba7f1b9](https://github.com/bustle/mobiledoc-kit/commit/ba7f1b9))
* Split render from editor instantiation ([6b05a4f](https://github.com/bustle/mobiledoc-kit/commit/6b05a4f))



<a name="0.3.4"></a>
## <small>0.3.4 (2015-08-18)</small>

* 0.3.4 ([f48a326](https://github.com/bustle/mobiledoc-kit/commit/f48a326))
* Export BoldCommand ([53bfd64](https://github.com/bustle/mobiledoc-kit/commit/53bfd64))



<a name="0.3.3"></a>
## <small>0.3.3 (2015-08-18)</small>

* 0.3.3 ([b572547](https://github.com/bustle/mobiledoc-kit/commit/b572547))
* Add `Key`, test for printable character on keydown when selection ([83deff5](https://github.com/bustle/mobiledoc-kit/commit/83deff5)), closes [#50](https://github.com/bustle/mobiledoc-kit/issues/50)
* Add forward and backward deletion to PostEditor ([cbb7182](https://github.com/bustle/mobiledoc-kit/commit/cbb7182)), closes [#36](https://github.com/bustle/mobiledoc-kit/issues/36)
* Add LinkedList#removeBy ([1cf6e59](https://github.com/bustle/mobiledoc-kit/commit/1cf6e59))
* Correct the browser's reported selection ([1fbec9f](https://github.com/bustle/mobiledoc-kit/commit/1fbec9f)), closes [#56](https://github.com/bustle/mobiledoc-kit/issues/56)
* Docs for postEditor, editor.run, README ([aae4eda](https://github.com/bustle/mobiledoc-kit/commit/aae4eda))
* Drop loadModel ([d1061eb](https://github.com/bustle/mobiledoc-kit/commit/d1061eb))
* Handle newlines when there is a selection ([3b71056](https://github.com/bustle/mobiledoc-kit/commit/3b71056)), closes [#49](https://github.com/bustle/mobiledoc-kit/issues/49)
* Make getUserMedia work across browsers ([f9df470](https://github.com/bustle/mobiledoc-kit/commit/f9df470))
* Refactor image card to use postEditor ([b4db504](https://github.com/bustle/mobiledoc-kit/commit/b4db504))
* Refactor newline insertion to use postEditor ([9a5c62e](https://github.com/bustle/mobiledoc-kit/commit/9a5c62e))
* Refactor some method into public postEditor methods ([356468b](https://github.com/bustle/mobiledoc-kit/commit/356468b))
* Remove unused MarkupSection#markerContaining ([44518f8](https://github.com/bustle/mobiledoc-kit/commit/44518f8))
* remove unused MarkupSection#split ([c42329b](https://github.com/bustle/mobiledoc-kit/commit/c42329b))
* Render a first marker with a leading space using NO_BREAK_SPACE ([f20a890](https://github.com/bustle/mobiledoc-kit/commit/f20a890)), closes [#75](https://github.com/bustle/mobiledoc-kit/issues/75)
* Render a last marker with trailing space using NO_BREAK_SPACE ([e1a5eda](https://github.com/bustle/mobiledoc-kit/commit/e1a5eda)), closes [#68](https://github.com/bustle/mobiledoc-kit/issues/68)
* rerender and didUpdate should be scheduled ([7e8a35c](https://github.com/bustle/mobiledoc-kit/commit/7e8a35c))
* use triggerDelete instead of execCommand ([c0a84a9](https://github.com/bustle/mobiledoc-kit/commit/c0a84a9))



<a name="0.3.2"></a>
## <small>0.3.2 (2015-08-12)</small>

* 0.3.2 ([c6d544e](https://github.com/bustle/mobiledoc-kit/commit/c6d544e))
* built website from 57aa456aea525555af553c5ce9359ba39cf54cee ([c404d3b](https://github.com/bustle/mobiledoc-kit/commit/c404d3b))
* Ensure parsed mobiledocs have a blank marker ([e6f656c](https://github.com/bustle/mobiledoc-kit/commit/e6f656c))
* Handle empty DOM nodes ([cfa4624](https://github.com/bustle/mobiledoc-kit/commit/cfa4624))



<a name="0.3.1"></a>
## <small>0.3.1 (2015-08-11)</small>

* 0.3.1 ([57aa456](https://github.com/bustle/mobiledoc-kit/commit/57aa456))
* built website from 059f4f3d6c14b18b38e3c7164301df893b638e04 ([cb8e11d](https://github.com/bustle/mobiledoc-kit/commit/cb8e11d))
* Close markers properly in editor-dom renderer ([16569cb](https://github.com/bustle/mobiledoc-kit/commit/16569cb))
* Ensure Marker#join returns a Marker with a builder ([19a30b3](https://github.com/bustle/mobiledoc-kit/commit/19a30b3))
* Ensure that the editor triggers an update when clicking "heading" ([5344ca2](https://github.com/bustle/mobiledoc-kit/commit/5344ca2)), closes [#58](https://github.com/bustle/mobiledoc-kit/issues/58)
* isEmpty for linked list ([3dceea4](https://github.com/bustle/mobiledoc-kit/commit/3dceea4))
* Restore correct unprintable character ([462d9a7](https://github.com/bustle/mobiledoc-kit/commit/462d9a7))
* Use `isEmpty` prop instead of `empty()` method on marker and section ([7c01249](https://github.com/bustle/mobiledoc-kit/commit/7c01249))
* Use builder for marker clone ([41a8214](https://github.com/bustle/mobiledoc-kit/commit/41a8214))



<a name="0.3.0"></a>
## 0.3.0 (2015-08-11)

* 0.3.0 ([059f4f3](https://github.com/bustle/mobiledoc-kit/commit/059f4f3))
* Handle newline at start or end of section ([3f113b3](https://github.com/bustle/mobiledoc-kit/commit/3f113b3)), closes [#39](https://github.com/bustle/mobiledoc-kit/issues/39)
* use a single loop ([d94aacb](https://github.com/bustle/mobiledoc-kit/commit/d94aacb))



<a name="0.2.7"></a>
## <small>0.2.7 (2015-08-10)</small>

* 0.2.7 ([b4efbef](https://github.com/bustle/mobiledoc-kit/commit/b4efbef))
* Drop embed in favor of bustle cards ([237bf4a](https://github.com/bustle/mobiledoc-kit/commit/237bf4a))
* Ensure multiple markup applications are rendered appropriately ([0687c83](https://github.com/bustle/mobiledoc-kit/commit/0687c83))



<a name="0.2.6"></a>
## <small>0.2.6 (2015-08-10)</small>

* 0.2.6 ([63474c8](https://github.com/bustle/mobiledoc-kit/commit/63474c8))
* Add objectAt to linked-list ([b13be70](https://github.com/bustle/mobiledoc-kit/commit/b13be70))
* Add splice method to linked list ([6e12e70](https://github.com/bustle/mobiledoc-kit/commit/6e12e70))
* Drop custom list accessors/methods ([7731668](https://github.com/bustle/mobiledoc-kit/commit/7731668))
* Port markers to linked list ([34945e8](https://github.com/bustle/mobiledoc-kit/commit/34945e8))
* Port sections to a linked list ([8c6f343](https://github.com/bustle/mobiledoc-kit/commit/8c6f343))
* takeRange -> readRange ([3503e5e](https://github.com/bustle/mobiledoc-kit/commit/3503e5e))
* Use diff of prev/next marker's markups instead of assuming consistent order ([59b96ef](https://github.com/bustle/mobiledoc-kit/commit/59b96ef)), closes [#51](https://github.com/bustle/mobiledoc-kit/issues/51)



<a name="0.2.5"></a>
## <small>0.2.5 (2015-08-10)</small>

* 0.2.5 ([c9bc65c](https://github.com/bustle/mobiledoc-kit/commit/c9bc65c))
* Add tests for adopt and free item hooks ([4b9f37f](https://github.com/bustle/mobiledoc-kit/commit/4b9f37f))
* Add toolbar test helpers, `triggerDelete` helper ([dd412c9](https://github.com/bustle/mobiledoc-kit/commit/dd412c9))
* built website from 854dc54f2edeef21a938e6b6176c5aaa610e3db4 ([39fe494](https://github.com/bustle/mobiledoc-kit/commit/39fe494))
* Handle different types of deletion ([9998dbb](https://github.com/bustle/mobiledoc-kit/commit/9998dbb)), closes [#37](https://github.com/bustle/mobiledoc-kit/issues/37)
* Initial linked list implementation ([3dd658e](https://github.com/bustle/mobiledoc-kit/commit/3dd658e))
* Make broccoli-funnel a dep ([3883367](https://github.com/bustle/mobiledoc-kit/commit/3883367))
* Port render nodes to use the linked list implementation ([d262593](https://github.com/bustle/mobiledoc-kit/commit/d262593))
* Remove Marker.createBlank ([1c1f04b](https://github.com/bustle/mobiledoc-kit/commit/1c1f04b))
* Use `triggerDelete` and remove some of the skipped-in-phantom tests ([433b783](https://github.com/bustle/mobiledoc-kit/commit/433b783))



<a name="0.2.4"></a>
## <small>0.2.4 (2015-08-07)</small>

* 0.2.4 ([854dc54](https://github.com/bustle/mobiledoc-kit/commit/854dc54))
* Add .editorconfig & .gitignore additions ([875f7f4](https://github.com/bustle/mobiledoc-kit/commit/875f7f4))
* Add `PostNodeBuilder`, remove post-builder, Markup.create ([ad9d9f9](https://github.com/bustle/mobiledoc-kit/commit/ad9d9f9))
* Add Editor#applyMarkupToSelection, change bold command to use it ([f3e99c6](https://github.com/bustle/mobiledoc-kit/commit/f3e99c6))
* Added Gitter badge ([be6d670](https://github.com/bustle/mobiledoc-kit/commit/be6d670))
* built website from 4acc28b64b352ca2f4ea5fa99a1af42e35e7add8 ([b96d75e](https://github.com/bustle/mobiledoc-kit/commit/b96d75e))
* change block commands to operate semantically, add ReversibleToolbarButton ([8ded94f](https://github.com/bustle/mobiledoc-kit/commit/8ded94f))
* Change Italic command to operate semantically, Bold command uses "strong" tag ([d0c834c](https://github.com/bustle/mobiledoc-kit/commit/d0c834c))
* Classify commands, change FormatBlock command to operate semantically ([3e7e829](https://github.com/bustle/mobiledoc-kit/commit/3e7e829))
* Fix embed-intent ([b89d4fe](https://github.com/bustle/mobiledoc-kit/commit/b89d4fe))
* Fix flexbox in Safari ([058155a](https://github.com/bustle/mobiledoc-kit/commit/058155a))
* Fixes mobiledoc sample & removes jQuery from usage ([dc99c85](https://github.com/bustle/mobiledoc-kit/commit/dc99c85))
* Ignore file with ENV for server ([845ab5d](https://github.com/bustle/mobiledoc-kit/commit/845ab5d))
* Normalize tag names for sections ([1d16466](https://github.com/bustle/mobiledoc-kit/commit/1d16466))
* Post images to be cards ([2b88550](https://github.com/bustle/mobiledoc-kit/commit/2b88550))
* Refactor editor to delegate selection methods to `Cursor` ([674d399](https://github.com/bustle/mobiledoc-kit/commit/674d399))
* Separate default and named imports (fixes confused syntax checker) ([897e35a](https://github.com/bustle/mobiledoc-kit/commit/897e35a))
* Upgrade to broccoli-multi-builder 0.2.7 (brings sourcemaps) ([94f120d](https://github.com/bustle/mobiledoc-kit/commit/94f120d))
* use element.classList ([75940ff](https://github.com/bustle/mobiledoc-kit/commit/75940ff))
* Use normalizeTagName, Markup.create ([dcf686e](https://github.com/bustle/mobiledoc-kit/commit/dcf686e))
* bugfix: Allow selecting across sections ([f89d346](https://github.com/bustle/mobiledoc-kit/commit/f89d346))



<a name="0.2.3"></a>
## <small>0.2.3 (2015-07-31)</small>

* 0.2.3 ([4acc28b](https://github.com/bustle/mobiledoc-kit/commit/4acc28b))
* built website from 0cc1746c4433b9896e85fe3fbd17b760247b0bd7 ([97f42c6](https://github.com/bustle/mobiledoc-kit/commit/97f42c6))
* changing to card display state triggers editor update ([4d0ad36](https://github.com/bustle/mobiledoc-kit/commit/4d0ad36))
* Update README.md ([60a5b77](https://github.com/bustle/mobiledoc-kit/commit/60a5b77))



<a name="0.2.2"></a>
## <small>0.2.2 (2015-07-31)</small>

* 0.2.2 ([0cc1746](https://github.com/bustle/mobiledoc-kit/commit/0cc1746))
* change selfie demo to use `src` ([be00508](https://github.com/bustle/mobiledoc-kit/commit/be00508))
* Clean up demo ([f49d483](https://github.com/bustle/mobiledoc-kit/commit/f49d483))
* fix safari bug in demo.js ([1fa57e6](https://github.com/bustle/mobiledoc-kit/commit/1fa57e6))
* Handle deletion (without selection) semantically ([5febfc4](https://github.com/bustle/mobiledoc-kit/commit/5febfc4))
* Handle newline semantically, use special chars to denote text nodes and unprintable chars in editor  ([99824ba](https://github.com/bustle/mobiledoc-kit/commit/99824ba))
* Update index.html ([f074dd4](https://github.com/bustle/mobiledoc-kit/commit/f074dd4))
* Update README.md ([510faeb](https://github.com/bustle/mobiledoc-kit/commit/510faeb))



<a name="0.2.1"></a>
## <small>0.2.1 (2015-07-29)</small>

* 0.2.1 ([33d296a](https://github.com/bustle/mobiledoc-kit/commit/33d296a))
* Add ember-addon functionality ([c1e4991](https://github.com/bustle/mobiledoc-kit/commit/c1e4991))
* Tweak README ([878c877](https://github.com/bustle/mobiledoc-kit/commit/878c877))



<a name="0.2.0"></a>
## 0.2.0 (2015-07-29)

* 0.2.0 ([14dec35](https://github.com/bustle/mobiledoc-kit/commit/14dec35))
* ability to get cursor index ([244b7b5](https://github.com/bustle/mobiledoc-kit/commit/244b7b5))
* abstract auto typing text formatters ([f16e8b2](https://github.com/bustle/mobiledoc-kit/commit/f16e8b2))
* add $ and QUnit to jshint globals ([710664f](https://github.com/bustle/mobiledoc-kit/commit/710664f))
* Add a selfie card to the demo ([1e471f8](https://github.com/bustle/mobiledoc-kit/commit/1e471f8))
* Add fixme ([89a60bc](https://github.com/bustle/mobiledoc-kit/commit/89a60bc))
* add jquery ([006f74e](https://github.com/bustle/mobiledoc-kit/commit/006f74e))
* Add Marker, Section, Section parser ([b757a3b](https://github.com/bustle/mobiledoc-kit/commit/b757a3b))
* Add mobiledoc renderer test, fix tests ([d82b625](https://github.com/bustle/mobiledoc-kit/commit/d82b625))
* Add more options to the demo, clean up its style and UI ([6b0c45a](https://github.com/bustle/mobiledoc-kit/commit/6b0c45a))
* Add new renderer ([998c95a](https://github.com/bustle/mobiledoc-kit/commit/998c95a))
* add npm scripts to build and deploy website ([205f169](https://github.com/bustle/mobiledoc-kit/commit/205f169))
* add Post parser ([d83302d](https://github.com/bustle/mobiledoc-kit/commit/d83302d))
* Add tests for parsers ([4a6edfb](https://github.com/bustle/mobiledoc-kit/commit/4a6edfb))
* Added the ability to specify server url ([ea6f526](https://github.com/bustle/mobiledoc-kit/commit/ea6f526))
* adding loadModel and model option ([c02edbe](https://github.com/bustle/mobiledoc-kit/commit/c02edbe))
* Allow markers to determine if they closing or opening markup ([aec3812](https://github.com/bustle/mobiledoc-kit/commit/aec3812))
* Assert that cards are rendered in the editor, and are noneditable ([27cd46e](https://github.com/bustle/mobiledoc-kit/commit/27cd46e))
* basic test for pressing a letter in the editor ([f1372c5](https://github.com/bustle/mobiledoc-kit/commit/f1372c5))
* Better server error messages ([aca842a](https://github.com/bustle/mobiledoc-kit/commit/aca842a))
* breakup css files and build ([518ad4d](https://github.com/bustle/mobiledoc-kit/commit/518ad4d))
* Bring in DOMRenderer from external dep mobiledoc-dom-renderer ([a78b990](https://github.com/bustle/mobiledoc-kit/commit/a78b990))
* bug fix: embed intent hiding ([822d40a](https://github.com/bustle/mobiledoc-kit/commit/822d40a))
* bug fix: positioning when resizing window while editing a link ([d8e6b3b](https://github.com/bustle/mobiledoc-kit/commit/d8e6b3b))
* Build dist ([4d6e05f](https://github.com/bustle/mobiledoc-kit/commit/4d6e05f))
* build with esperanto ([278e02c](https://github.com/bustle/mobiledoc-kit/commit/278e02c))
* built website from 558499e7b0c5fbc76f554b3265f5a7dfb186d161 ([9512f1d](https://github.com/bustle/mobiledoc-kit/commit/9512f1d))
* built website from 6b0c45a130fd3a96be7ccb8b7e7186c494c7dfed ([433947d](https://github.com/bustle/mobiledoc-kit/commit/433947d))
* built website from b0933bfc8fc57aef1d2d68c9dd6d9bc1f28d1593 ([453856e](https://github.com/bustle/mobiledoc-kit/commit/453856e))
* built website from bb36364c86f87721b6572f6e8adbe5ff2e8b2ca8 ([99372ee](https://github.com/bustle/mobiledoc-kit/commit/99372ee))
* Bump for renderers to support cards ([055776e](https://github.com/bustle/mobiledoc-kit/commit/055776e))
* Bump html renderer to support cards ([2e9f668](https://github.com/bustle/mobiledoc-kit/commit/2e9f668))
* bundle the loader to simplify end-usage ([d4661eb](https://github.com/bustle/mobiledoc-kit/commit/d4661eb))
* Cards docs ([ae07bfd](https://github.com/bustle/mobiledoc-kit/commit/ae07bfd))
* change marker type to "marker", use "tagName" in markup ([875d31c](https://github.com/bustle/mobiledoc-kit/commit/875d31c))
* change npm command to broccoli serve ([0a36660](https://github.com/bustle/mobiledoc-kit/commit/0a36660))
* cleaner embed url settings ([6f0a1de](https://github.com/bustle/mobiledoc-kit/commit/6f0a1de))
* cleaning up Editor constructor ([a0bedfa](https://github.com/bustle/mobiledoc-kit/commit/a0bedfa))
* cleanup some complexity ([074f846](https://github.com/bustle/mobiledoc-kit/commit/074f846))
* code cleanup and minor bug fixes ([d2121ac](https://github.com/bustle/mobiledoc-kit/commit/d2121ac))
* combine contentEditable hacks ([0f157ea](https://github.com/bustle/mobiledoc-kit/commit/0f157ea))
* compatibility fixes for IE10 ([9d9a530](https://github.com/bustle/mobiledoc-kit/commit/9d9a530))
* compiler now included as npm dep.  Move embed renderers here instead of compiler ([d8496ac](https://github.com/bustle/mobiledoc-kit/commit/d8496ac))
* Correct spelling ([db0d75e](https://github.com/bustle/mobiledoc-kit/commit/db0d75e))
* cross-browser fixes, positioning bug fixes, code cleanup, update compiler ([2c4c1d4](https://github.com/bustle/mobiledoc-kit/commit/2c4c1d4))
* crude image embeds ([84a634a](https://github.com/bustle/mobiledoc-kit/commit/84a634a))
* crude oEmbed working ([7d523d4](https://github.com/bustle/mobiledoc-kit/commit/7d523d4))
* destroy editor in demo before booting a new one ([5b59865](https://github.com/bustle/mobiledoc-kit/commit/5b59865))
* display rendered HTML in the demo ([558499e](https://github.com/bustle/mobiledoc-kit/commit/558499e))
* document building and deploying ([b7bdb12](https://github.com/bustle/mobiledoc-kit/commit/b7bdb12))
* don't show toolbar when only selecting whitespace ([565f8b1](https://github.com/bustle/mobiledoc-kit/commit/565f8b1))
* Drop compiler dependency ([45ce1f0](https://github.com/bustle/mobiledoc-kit/commit/45ce1f0))
* editor 'selection', 'selectionUpdated', and 'selectionEnded' events ([53cc297](https://github.com/bustle/mobiledoc-kit/commit/53cc297))
* eliminated constants file ([f4b6850](https://github.com/bustle/mobiledoc-kit/commit/f4b6850))
* embed intent responsiveness and cleanup ([83a73ff](https://github.com/bustle/mobiledoc-kit/commit/83a73ff))
* embed intents ([3bdb065](https://github.com/bustle/mobiledoc-kit/commit/3bdb065))
* embed loading indicator ([ccd33c4](https://github.com/bustle/mobiledoc-kit/commit/ccd33c4))
* embed toolbar, loading indication are now relative to embed intent view ([0a21ae7](https://github.com/bustle/mobiledoc-kit/commit/0a21ae7))
* Enabled CORS on the server ([2f5e34d](https://github.com/bustle/mobiledoc-kit/commit/2f5e34d))
* ensure floating toolbar always stays onscreen ([c3ea10d](https://github.com/bustle/mobiledoc-kit/commit/c3ea10d))
* Ensure rendered editor dom closes markup tags ([12c20af](https://github.com/bustle/mobiledoc-kit/commit/12c20af))
* ensure starting with an empty editor generates a block tag ([5e834d5](https://github.com/bustle/mobiledoc-kit/commit/5e834d5))
* error messages ([941c829](https://github.com/bustle/mobiledoc-kit/commit/941c829))
* es6 modules ([ac7b1f0](https://github.com/bustle/mobiledoc-kit/commit/ac7b1f0))
* events ([8e870d6](https://github.com/bustle/mobiledoc-kit/commit/8e870d6))
* explain how to deploy website in readme ([bb36364](https://github.com/bustle/mobiledoc-kit/commit/bb36364))
* faster tagName lookups ([8542c4e](https://github.com/bustle/mobiledoc-kit/commit/8542c4e))
* Fix bad import in editor-dom-test ([1ca3c56](https://github.com/bustle/mobiledoc-kit/commit/1ca3c56))
* fix broken build ([e6996a1](https://github.com/bustle/mobiledoc-kit/commit/e6996a1))
* fix bug in demo ([3900924](https://github.com/bustle/mobiledoc-kit/commit/3900924))
* fix CSS and JS for safari and FF ([f95aa2b](https://github.com/bustle/mobiledoc-kit/commit/f95aa2b))
* fix demo to run as local file without needing to start the server ([dfbbaac](https://github.com/bustle/mobiledoc-kit/commit/dfbbaac))
* Fix dom renderer to render cards ([b0933bf](https://github.com/bustle/mobiledoc-kit/commit/b0933bf))
* Fix failing test on Firefox due to non-deterministic attr ordering ([3976fd0](https://github.com/bustle/mobiledoc-kit/commit/3976fd0))
* fix jshint failure ([d7705e5](https://github.com/bustle/mobiledoc-kit/commit/d7705e5))
* handle failed images ([dd6614d](https://github.com/bustle/mobiledoc-kit/commit/dd6614d))
* handle live update special cases (enter, backspace) ([f6b5d9d](https://github.com/bustle/mobiledoc-kit/commit/f6b5d9d))
* Identify multiple selections and reparse them all ([0eb62f4](https://github.com/bustle/mobiledoc-kit/commit/0eb62f4))
* idk heroku ([a7e39be](https://github.com/bustle/mobiledoc-kit/commit/a7e39be))
* Ignore .env for AWS keys ([ed0410a](https://github.com/bustle/mobiledoc-kit/commit/ed0410a))
* Ignore tmp/ ([27aed62](https://github.com/bustle/mobiledoc-kit/commit/27aed62))
* image uploading ([4a48469](https://github.com/bustle/mobiledoc-kit/commit/4a48469))
* importing content-kit-compiler from npm ([26cbd84](https://github.com/bustle/mobiledoc-kit/commit/26cbd84))
* importing content-kit-utils from npm ([a820cbb](https://github.com/bustle/mobiledoc-kit/commit/a820cbb))
* improve test helper's makeDOM ([f6a7c07](https://github.com/bustle/mobiledoc-kit/commit/f6a7c07))
* improved text parsing ([a4129a0](https://github.com/bustle/mobiledoc-kit/commit/a4129a0))
* improving design ([89e7be1](https://github.com/bustle/mobiledoc-kit/commit/89e7be1))
* initial commit ([59e240e](https://github.com/bustle/mobiledoc-kit/commit/59e240e))
* integrated upload/embed server directing into app ([8eeeb50](https://github.com/bustle/mobiledoc-kit/commit/8eeeb50))
* integrating LESS ([6d69d9c](https://github.com/bustle/mobiledoc-kit/commit/6d69d9c))
* Introduce cards ([ca43198](https://github.com/bustle/mobiledoc-kit/commit/ca43198))
* link tooltips ([1bd3276](https://github.com/bustle/mobiledoc-kit/commit/1bd3276))
* local image rendering ([df3de85](https://github.com/bustle/mobiledoc-kit/commit/df3de85))
* minor style cleanup of demo ([7bde2c7](https://github.com/bustle/mobiledoc-kit/commit/7bde2c7))
* mobiledoc documentation ([b1b8bec](https://github.com/bustle/mobiledoc-kit/commit/b1b8bec))
* more deploy goodies ([8cbfaab](https://github.com/bustle/mobiledoc-kit/commit/8cbfaab))
* more embed intent ux fixes ([a6321a4](https://github.com/bustle/mobiledoc-kit/commit/a6321a4))
* Move Section model to MarkupSection, use across codebase ([3c9465d](https://github.com/bustle/mobiledoc-kit/commit/3c9465d))
* mucho trabajo ([2304dc3](https://github.com/bustle/mobiledoc-kit/commit/2304dc3))
* new transpiler to remove amd ([874115f](https://github.com/bustle/mobiledoc-kit/commit/874115f))
* Only reference runtime in demo ([1926c95](https://github.com/bustle/mobiledoc-kit/commit/1926c95))
* overhaul gulp build system. Include compiler in build ([5e39bb2](https://github.com/bustle/mobiledoc-kit/commit/5e39bb2))
* overhaul gulp build system. Include compiler in build ([3105470](https://github.com/bustle/mobiledoc-kit/commit/3105470))
* parse dom node, not innerHTML ([e77c366](https://github.com/bustle/mobiledoc-kit/commit/e77c366))
* Pass version number and sections payload on mobiledocs ([148735b](https://github.com/bustle/mobiledoc-kit/commit/148735b))
* Post nodes no longer store closed and open, but all their markups ([0f69dc1](https://github.com/bustle/mobiledoc-kit/commit/0f69dc1))
* prepping embeds for interactive editing. ([40937bd](https://github.com/bustle/mobiledoc-kit/commit/40937bd))
* Prototype serializer for posts ([18ba2a0](https://github.com/bustle/mobiledoc-kit/commit/18ba2a0))
* publish builds ([4e9dcd0](https://github.com/bustle/mobiledoc-kit/commit/4e9dcd0))
* Re-use card blocks from a previous render ([6dd5a69](https://github.com/bustle/mobiledoc-kit/commit/6dd5a69))
* README tweaks for website deploy ([dcfcade](https://github.com/bustle/mobiledoc-kit/commit/dcfcade))
* README updates ([3e57efc](https://github.com/bustle/mobiledoc-kit/commit/3e57efc))
* Refactor Image and Card sections to a new renderer ([67c2e0d](https://github.com/bustle/mobiledoc-kit/commit/67c2e0d))
* Remove CORS ([3c084ce](https://github.com/bustle/mobiledoc-kit/commit/3c084ce))
* remove heroku postinstall script ([497df98](https://github.com/bustle/mobiledoc-kit/commit/497df98))
* remove some unused code ([a9f7f02](https://github.com/bustle/mobiledoc-kit/commit/a9f7f02))
* remove unused ember-cli-test-loader bower component ([3bc230a](https://github.com/bustle/mobiledoc-kit/commit/3bc230a))
* Removes gulp dependencies ([422f987](https://github.com/bustle/mobiledoc-kit/commit/422f987))
* revert some experimental code ([acad7cb](https://github.com/bustle/mobiledoc-kit/commit/acad7cb))
* sample cards: simple, edit, input ([6a440dc](https://github.com/bustle/mobiledoc-kit/commit/6a440dc))
* screenshot ([ec7b780](https://github.com/bustle/mobiledoc-kit/commit/ec7b780))
* section has type='section' and tagName property ([e6509e4](https://github.com/bustle/mobiledoc-kit/commit/e6509e4))
* serverUrl property changed to serverHost ([2843105](https://github.com/bustle/mobiledoc-kit/commit/2843105))
* Show innerHTML (with | between text nodes) of editor in demo ([5e25491](https://github.com/bustle/mobiledoc-kit/commit/5e25491))
* simplify animations ([7ff5fa6](https://github.com/bustle/mobiledoc-kit/commit/7ff5fa6))
* skip link test in phantomjs ([7557d43](https://github.com/bustle/mobiledoc-kit/commit/7557d43))
* Small formatting cleanup ([0589f3c](https://github.com/bustle/mobiledoc-kit/commit/0589f3c))
* Specify libDirName for testTreeBuilder ([9bf4ab0](https://github.com/bustle/mobiledoc-kit/commit/9bf4ab0))
* start live update ([1e5b1cf](https://github.com/bustle/mobiledoc-kit/commit/1e5b1cf))
* sticky toolbar support ([8ec1188](https://github.com/bustle/mobiledoc-kit/commit/8ec1188))
* stub drag and drop ([76e465c](https://github.com/bustle/mobiledoc-kit/commit/76e465c))
* style touchups ([7752de9](https://github.com/bustle/mobiledoc-kit/commit/7752de9))
* support for pasting markup ([bf5b57f](https://github.com/bustle/mobiledoc-kit/commit/bf5b57f))
* Test that editor can accept mobiledoc format and render it ([06def74](https://github.com/bustle/mobiledoc-kit/commit/06def74))
* Tests for creating/deleting sections ([dafdee5](https://github.com/bustle/mobiledoc-kit/commit/dafdee5))
* Text fixes ([86651c0](https://github.com/bustle/mobiledoc-kit/commit/86651c0))
* toolbar cleanup ([bc947fa](https://github.com/bustle/mobiledoc-kit/commit/bc947fa))
* Tweak docs to show booting node server ([6261c7c](https://github.com/bustle/mobiledoc-kit/commit/6261c7c))
* Tweak README ([d6f9ca8](https://github.com/bustle/mobiledoc-kit/commit/d6f9ca8))
* typo fix ([a2bbf96](https://github.com/bustle/mobiledoc-kit/commit/a2bbf96))
* Typo fix ([f09e33a](https://github.com/bustle/mobiledoc-kit/commit/f09e33a))
* update compiler ([216fd3f](https://github.com/bustle/mobiledoc-kit/commit/216fd3f))
* update compiler, update demo code pane ux ([f830621](https://github.com/bustle/mobiledoc-kit/commit/f830621))
* update config setup ([3b0c57f](https://github.com/bustle/mobiledoc-kit/commit/3b0c57f))
* update demo, add compat layer for win/doc, compile LESS ([3c505d7](https://github.com/bustle/mobiledoc-kit/commit/3c505d7))
* Update editor to parse the DOM to the post AT ([e59eaf7](https://github.com/bustle/mobiledoc-kit/commit/e59eaf7))
* Update index.html ([81b5649](https://github.com/bustle/mobiledoc-kit/commit/81b5649))
* Update LICENSE year, owners ([442740f](https://github.com/bustle/mobiledoc-kit/commit/442740f))
* Update MOBILEDOC.md ([e9a5d42](https://github.com/bustle/mobiledoc-kit/commit/e9a5d42))
* Update README ([9d417f0](https://github.com/bustle/mobiledoc-kit/commit/9d417f0))
* Update README.md ([504adbe](https://github.com/bustle/mobiledoc-kit/commit/504adbe))
* Update README.md ([0b9222d](https://github.com/bustle/mobiledoc-kit/commit/0b9222d))
* Update renderers ([f775642](https://github.com/bustle/mobiledoc-kit/commit/f775642))
* update server stuff ([3a01391](https://github.com/bustle/mobiledoc-kit/commit/3a01391))
* update to work with broccoli multi builder 0.2.2, bring in loader.js to tests ([a0c5c56](https://github.com/bustle/mobiledoc-kit/commit/a0c5c56))
* use broccoli-multi-builder to output amd, globals, cjs ([35f34c8](https://github.com/bustle/mobiledoc-kit/commit/35f34c8))
* Use broccoli-test-builder and fix jshint failures ([59d103c](https://github.com/bustle/mobiledoc-kit/commit/59d103c))
* use content-kit-compiler 0.3.1 ([2613387](https://github.com/bustle/mobiledoc-kit/commit/2613387))
* Use custom IE flexbox CSS for demo ([2839ce5](https://github.com/bustle/mobiledoc-kit/commit/2839ce5))
* use ENV vars instead of config.json for api keys; setup for deploy ([7510ee0](https://github.com/bustle/mobiledoc-kit/commit/7510ee0))
* use EventListener mixin to ensure listeners are destroyed by views ([9ef8f59](https://github.com/bustle/mobiledoc-kit/commit/9ef8f59))
* use markup model ([63b8fbf](https://github.com/bustle/mobiledoc-kit/commit/63b8fbf))
* Use phantomjs at travis ([6e30ac8](https://github.com/bustle/mobiledoc-kit/commit/6e30ac8))
* Use runtime renderer in demo ([8213e30](https://github.com/bustle/mobiledoc-kit/commit/8213e30))
* use testem for tests ([532c974](https://github.com/bustle/mobiledoc-kit/commit/532c974))
* using tags from compiler ([19a2464](https://github.com/bustle/mobiledoc-kit/commit/19a2464))
* View class abstraction and code cleanup ([2a3b093](https://github.com/bustle/mobiledoc-kit/commit/2a3b093))
* wooo ([c74e6a2](https://github.com/bustle/mobiledoc-kit/commit/c74e6a2))
* youtube embeds ([028f3ba](https://github.com/bustle/mobiledoc-kit/commit/028f3ba))
* z-index management. better messages UI ([817166c](https://github.com/bustle/mobiledoc-kit/commit/817166c))
* Test: displaying toolbar, clicking format butons, creating links ([9a10d7a](https://github.com/bustle/mobiledoc-kit/commit/9a10d7a))
* WIP: Add destroy to editor, make mobiledoc observable ([98075e8](https://github.com/bustle/mobiledoc-kit/commit/98075e8))
* WIP: parse across section edits. TODO: handle deletion ([d062eab](https://github.com/bustle/mobiledoc-kit/commit/d062eab))
* WIP: Start rewriting the demo ([43fd3c6](https://github.com/bustle/mobiledoc-kit/commit/43fd3c6))



