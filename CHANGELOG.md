<a name="0.8.0-beta.1"></a>
# 0.8.0-beta.1 (2016-01-07)




<a name="0.8.0-beta.1"></a>
# 0.8.0-beta.1 (2016-01-07)


* 0.8.0-beta.1 ([704bb20](https://github.com/bustlelabs/mobiledoc-kit/commit/704bb20))
* Blur element focus on destroy, add null/blank demos ([845c041](https://github.com/bustlelabs/mobiledoc-kit/commit/845c041))
* Fix bug #276: Copy-pasting from Google Docs and Sheets does not work on Chrome on Windows ([b3aac9e](https://github.com/bustlelabs/mobiledoc-kit/commit/b3aac9e)), closes [#276](https://github.com/bustlelabs/mobiledoc-kit/issues/276)
* marker#deleteValueAtOffset detects if the character is outside the BMP ([f3b72ae](https://github.com/bustlelabs/mobiledoc-kit/commit/f3b72ae)), closes [#274](https://github.com/bustlelabs/mobiledoc-kit/issues/274)
* Merge pull request #275 from bustlelabs/fix-marker-emoji-deletion-274 ([b662def](https://github.com/bustlelabs/mobiledoc-kit/commit/b662def))
* Merge pull request #279 from mixonic/blank ([1754844](https://github.com/bustlelabs/mobiledoc-kit/commit/1754844))
* Merge pull request #281 from mixonic/yb-fix-bug-276 ([96ea818](https://github.com/bustlelabs/mobiledoc-kit/commit/96ea818))
* Merge pull request #282 from bustlelabs/fix-text-expansions-280 ([1892043](https://github.com/bustlelabs/mobiledoc-kit/commit/1892043))
* Merge pull request #284 from bustlelabs/change-dependencies ([adda41d](https://github.com/bustlelabs/mobiledoc-kit/commit/adda41d))
* only find text expansion when at end of markup section ([9c3fa90](https://github.com/bustlelabs/mobiledoc-kit/commit/9c3fa90)), closes [#280](https://github.com/bustlelabs/mobiledoc-kit/issues/280)
* Remove content-kit-utils, move mobiledoc renderers to dependencies ([a625f7a](https://github.com/bustlelabs/mobiledoc-kit/commit/a625f7a))
* Update changelog ([8f83e6d](https://github.com/bustlelabs/mobiledoc-kit/commit/8f83e6d))



<a name="0.7.3"></a>
## 0.7.3 (2015-12-17)


* 0.7.3 ([45b3b87](https://github.com/bustlelabs/mobiledoc-kit/commit/45b3b87))
* Add text parser, use it for handling pasted text ([c3e2ffd](https://github.com/bustlelabs/mobiledoc-kit/commit/c3e2ffd)), closes [#263](https://github.com/bustlelabs/mobiledoc-kit/issues/263)
* built website from 94507c9f49d15caa600469752480d6ea3ff4aa96 ([76b01fb](https://github.com/bustlelabs/mobiledoc-kit/commit/76b01fb))
* Clear selection in editor#destroy, make editorDomRenderer#destroy safer ([15ceb0f](https://github.com/bustlelabs/mobiledoc-kit/commit/15ceb0f))
* ensure style tags are skipped when parsing HTML/dom ([5409b1a](https://github.com/bustlelabs/mobiledoc-kit/commit/5409b1a))
* Merge pull request #267 from bustlelabs/copy-paste-refactor-259 ([e687d3d](https://github.com/bustlelabs/mobiledoc-kit/commit/e687d3d))
* Merge pull request #268 from bustlelabs/text-parser-263 ([e003067](https://github.com/bustlelabs/mobiledoc-kit/commit/e003067))
* Merge pull request #269 from bustlelabs/skip-style-nodes ([a23670d](https://github.com/bustlelabs/mobiledoc-kit/commit/a23670d))
* Merge pull request #271 from bustlelabs/cursor-movement-with-card-and-list-270 ([00de273](https://github.com/bustlelabs/mobiledoc-kit/commit/00de273))
* Merge pull request #273 from bustlelabs/editor-destroy-fixes ([d12ee9a](https://github.com/bustlelabs/mobiledoc-kit/commit/d12ee9a))
* Refactor Position#move to work correctly when prev/next is list section ([3c73d86](https://github.com/bustlelabs/mobiledoc-kit/commit/3c73d86)), closes [#270](https://github.com/bustlelabs/mobiledoc-kit/issues/270)
* Refactor postEditor#insertPost to handle more situations ([cda1e7e](https://github.com/bustlelabs/mobiledoc-kit/commit/cda1e7e)), closes [#249](https://github.com/bustlelabs/mobiledoc-kit/issues/249) [#259](https://github.com/bustlelabs/mobiledoc-kit/issues/259)
* Tweak changelog ([94507c9](https://github.com/bustlelabs/mobiledoc-kit/commit/94507c9))
* Update changelog ([ed299a7](https://github.com/bustlelabs/mobiledoc-kit/commit/ed299a7))



<a name="0.7.2"></a>
## 0.7.2 (2015-12-14)


* 0.7.2 ([fc25f1d](https://github.com/bustlelabs/mobiledoc-kit/commit/fc25f1d))
* Avoid reparse after initial render ([a30897b](https://github.com/bustlelabs/mobiledoc-kit/commit/a30897b))
* built website from ea57d2f4ae42f7e855d44bb9f4e6690b6fe621d1 ([abf204a](https://github.com/bustlelabs/mobiledoc-kit/commit/abf204a))
* Catch, display and log rendering errors ([ce06ef3](https://github.com/bustlelabs/mobiledoc-kit/commit/ce06ef3))
* Clean up changelog ([eaaed00](https://github.com/bustlelabs/mobiledoc-kit/commit/eaaed00))
* Drop mutation observer during rerender ([26d3d78](https://github.com/bustlelabs/mobiledoc-kit/commit/26d3d78))
* Fix issue #256:  Copy-pasting from Notepad does not work ([e251455](https://github.com/bustlelabs/mobiledoc-kit/commit/e251455)), closes [#256](https://github.com/bustlelabs/mobiledoc-kit/issues/256)
* Merge pull request #262 from YoranBrondsema/yb-fix-bug-256 ([15dfb9e](https://github.com/bustlelabs/mobiledoc-kit/commit/15dfb9e)), closes [#256](https://github.com/bustlelabs/mobiledoc-kit/issues/256)
* Merge pull request #264 from mixonic/avoid-reparse ([69e7394](https://github.com/bustlelabs/mobiledoc-kit/commit/69e7394))
* Merge pull request #265 from mixonic/fix-newline ([3b00baf](https://github.com/bustlelabs/mobiledoc-kit/commit/3b00baf))
* Merge pull request #266 from mixonic/safe-website ([4af6d90](https://github.com/bustlelabs/mobiledoc-kit/commit/4af6d90))
* Optimize the compiler loop ([eeca363](https://github.com/bustlelabs/mobiledoc-kit/commit/eeca363))
* Set cursor to collapsed after hitting enter ([68cfa16](https://github.com/bustlelabs/mobiledoc-kit/commit/68cfa16))
* Update changelog ([ea57d2f](https://github.com/bustlelabs/mobiledoc-kit/commit/ea57d2f))



<a name="0.7.1"></a>
## 0.7.1 (2015-12-09)


* 0.7.1 ([49dafd8](https://github.com/bustlelabs/mobiledoc-kit/commit/49dafd8))
* Add better guard against inserting item from other list into linked list ([f7a4ef2](https://github.com/bustlelabs/mobiledoc-kit/commit/f7a4ef2))
* Add postEditor#toggleSection, works with ul/ol sections ([1e47433](https://github.com/bustlelabs/mobiledoc-kit/commit/1e47433)), closes [#186](https://github.com/bustlelabs/mobiledoc-kit/issues/186)
* Add support for tabs ([a677599](https://github.com/bustlelabs/mobiledoc-kit/commit/a677599))
* built website from 4a39224e72873b155d12e922865b5e9d426ea8c4 ([5c890e2](https://github.com/bustlelabs/mobiledoc-kit/commit/5c890e2))
* Document parser hooks ([06b1406](https://github.com/bustlelabs/mobiledoc-kit/commit/06b1406))
* IE11 Support ([3eeb2ba](https://github.com/bustlelabs/mobiledoc-kit/commit/3eeb2ba))
* Implement parserPlugins API ([f52d97e](https://github.com/bustlelabs/mobiledoc-kit/commit/f52d97e))
* Merge pull request #244 from mixonic/ie-11 ([0bcb2a5](https://github.com/bustlelabs/mobiledoc-kit/commit/0bcb2a5))
* Merge pull request #247 from bustlelabs/remove-ck-prefix ([38736a0](https://github.com/bustlelabs/mobiledoc-kit/commit/38736a0))
* Merge pull request #248 from bustlelabs/toggle-list-sections-186 ([f4fc3cc](https://github.com/bustlelabs/mobiledoc-kit/commit/f4fc3cc))
* Merge pull request #251 from bustlelabs/ll-refactor ([e0013dd](https://github.com/bustlelabs/mobiledoc-kit/commit/e0013dd))
* Merge pull request #254 from mixonic/tab-next ([3cfdd87](https://github.com/bustlelabs/mobiledoc-kit/commit/3cfdd87))
* Merge pull request #255 from bustlelabs/update-outdated-npm-modules ([6eff771](https://github.com/bustlelabs/mobiledoc-kit/commit/6eff771))
* Merge pull request #257 from mixonic/parser-hooks ([01fec18](https://github.com/bustlelabs/mobiledoc-kit/commit/01fec18))
* Update changelog ([a72fe64](https://github.com/bustlelabs/mobiledoc-kit/commit/a72fe64))
* update outdated modules (used updtr) ([0c5f102](https://github.com/bustlelabs/mobiledoc-kit/commit/0c5f102))
* Use '__mobiledoc-' prefix for element class names ([10eb490](https://github.com/bustlelabs/mobiledoc-kit/commit/10eb490))
* use ember-mobiledoc-editor v0.3.0 ([4a39224](https://github.com/bustlelabs/mobiledoc-kit/commit/4a39224))



<a name="0.7.0"></a>
# 0.7.0 (2015-11-24)


* 0.7.0 ([afbeb5e](https://github.com/bustlelabs/mobiledoc-kit/commit/afbeb5e))
* Merge pull request #245 from bustlelabs/update-card-docs ([7febf3f](https://github.com/bustlelabs/mobiledoc-kit/commit/7febf3f))
* update card docs ([5b87106](https://github.com/bustlelabs/mobiledoc-kit/commit/5b87106))
* Use ember-mobiledoc-editor@0.2.2-beta1 ([bd83fc5](https://github.com/bustlelabs/mobiledoc-kit/commit/bd83fc5))



<a name="0.6.2-beta1"></a>
## 0.6.2-beta1 (2015-11-23)


* Add versioning for Mobiledoc renderer, parser ([69a93e4](https://github.com/bustlelabs/mobiledoc-kit/commit/69a93e4))
* Fix DOM-dependent tests for IE Edge ([49bc53d](https://github.com/bustlelabs/mobiledoc-kit/commit/49bc53d))
* Fix un-executed tests ([d4ce7b9](https://github.com/bustlelabs/mobiledoc-kit/commit/d4ce7b9))
* Implement card refactor for editor-dom renderer ([3baafbe](https://github.com/bustlelabs/mobiledoc-kit/commit/3baafbe)), closes [#236](https://github.com/bustlelabs/mobiledoc-kit/issues/236) [#239](https://github.com/bustlelabs/mobiledoc-kit/issues/239)
* Merge pull request #238 from bustlelabs/update-editor-dom-card-renderer-236 ([0332d67](https://github.com/bustlelabs/mobiledoc-kit/commit/0332d67))
* Merge pull request #240 from mixonic/foobar ([0aa068c](https://github.com/bustlelabs/mobiledoc-kit/commit/0aa068c))
* Merge pull request #241 from mixonic/version-mobiledoc ([79d6f6c](https://github.com/bustlelabs/mobiledoc-kit/commit/79d6f6c))
* Merge pull request #242 from mixonic/ie-edge ([d4105e8](https://github.com/bustlelabs/mobiledoc-kit/commit/d4105e8))
* Silence testing-only failues on IE Edge ([0dc9ec6](https://github.com/bustlelabs/mobiledoc-kit/commit/0dc9ec6))
* Update changelog ([915a287](https://github.com/bustlelabs/mobiledoc-kit/commit/915a287))
* Use more constants for mobiledoc versions ([2d1b59f](https://github.com/bustlelabs/mobiledoc-kit/commit/2d1b59f))
* v0.6.2-beta1 ([ebdd180](https://github.com/bustlelabs/mobiledoc-kit/commit/ebdd180))



<a name="0.6.1"></a>
## 0.6.1 (2015-11-18)


* 0.6.0 ([0001015](https://github.com/bustlelabs/mobiledoc-kit/commit/0001015))
* 0.6.1 ([ff637c1](https://github.com/bustlelabs/mobiledoc-kit/commit/ff637c1))
* Add `update-changelog` npm script, update readme ([29e5278](https://github.com/bustlelabs/mobiledoc-kit/commit/29e5278))
* add changelog ([1aa18a6](https://github.com/bustlelabs/mobiledoc-kit/commit/1aa18a6))
* add logo to demo assets ([45e3b42](https://github.com/bustlelabs/mobiledoc-kit/commit/45e3b42))
* Add mobiledoc logo ([88e9902](https://github.com/bustlelabs/mobiledoc-kit/commit/88e9902))
* Add select option for codemirror card ([208f09d](https://github.com/bustlelabs/mobiledoc-kit/commit/208f09d))
* add small logo ([76f8e6e](https://github.com/bustlelabs/mobiledoc-kit/commit/76f8e6e))
* built website from 45e3b42b562ded870fe99c62af2918cbe55c3694 ([0937781](https://github.com/bustlelabs/mobiledoc-kit/commit/0937781))
* Fix project in a link ([e7bcab2](https://github.com/bustlelabs/mobiledoc-kit/commit/e7bcab2))
* Merge pull request #225 from mixonic/update-demo ([cdeb973](https://github.com/bustlelabs/mobiledoc-kit/commit/cdeb973))
* Merge pull request #227 from bustlelabs/update-demos ([fb16ec0](https://github.com/bustlelabs/mobiledoc-kit/commit/fb16ec0))
* Merge pull request #230 from bustlelabs/add-changelog ([852350e](https://github.com/bustlelabs/mobiledoc-kit/commit/852350e))
* Merge pull request #231 from bustlelabs/use-html-and-text-renderers-205 ([16326b0](https://github.com/bustlelabs/mobiledoc-kit/commit/16326b0))
* Merge pull request #237 from mixonic/retain-edit-mode ([7b781de](https://github.com/bustlelabs/mobiledoc-kit/commit/7b781de))
* Retain edit mode on cloned cards ([ebe19b8](https://github.com/bustlelabs/mobiledoc-kit/commit/ebe19b8))
* Update demo for mobiledoc 0.2.0-beta ([e078eeb](https://github.com/bustlelabs/mobiledoc-kit/commit/e078eeb))
* Update demos, add different renderers ([1d9b124](https://github.com/bustlelabs/mobiledoc-kit/commit/1d9b124))
* Update links to mobiledoc renderers ([d5d573e](https://github.com/bustlelabs/mobiledoc-kit/commit/d5d573e))
* update website build/deploy script messages ([34beec1](https://github.com/bustlelabs/mobiledoc-kit/commit/34beec1))
* Use ember-mobiledoc-*-renderer addons ([a7f5940](https://github.com/bustlelabs/mobiledoc-kit/commit/a7f5940))
* use ember-mobiledoc-dom-renderer ([fb8fd2d](https://github.com/bustlelabs/mobiledoc-kit/commit/fb8fd2d))
* Use html and text mobiledoc renderers for copy/paste ([6a1bbf7](https://github.com/bustlelabs/mobiledoc-kit/commit/6a1bbf7)), closes [#205](https://github.com/bustlelabs/mobiledoc-kit/issues/205)



<a name="0.6.0-beta4"></a>
# 0.6.0-beta4 (2015-11-10)


* 0.6.0-beta4 ([ec3b07e](https://github.com/bustlelabs/mobiledoc-kit/commit/ec3b07e))



<a name="0.6.0-beta3"></a>
# 0.6.0-beta3 (2015-11-10)


* Drop inCard, broke null section positions ([2300311](https://github.com/bustlelabs/mobiledoc-kit/commit/2300311))
* Merge pull request #224 from mixonic/drop-inCard ([0a0f0b2](https://github.com/bustlelabs/mobiledoc-kit/commit/0a0f0b2))



<a name="0.6.0-beta2"></a>
# 0.6.0-beta2 (2015-11-10)


* 0.6.0-beta2 ([a1d1df0](https://github.com/bustlelabs/mobiledoc-kit/commit/a1d1df0))
* Correct version: 0.6.0-beta1 ([532635e](https://github.com/bustlelabs/mobiledoc-kit/commit/532635e))



<a name="0.6.0-beta1"></a>
# 0.6.0-beta1 (2015-11-10)


* 0.6.0-beta.1 ([13f5193](https://github.com/bustlelabs/mobiledoc-kit/commit/13f5193))
* Content-Kit -> Mobiledoc Kit ([a3d31f6](https://github.com/bustlelabs/mobiledoc-kit/commit/a3d31f6))
* Correctly interpret a reported selection of the editor element ([937f359](https://github.com/bustlelabs/mobiledoc-kit/commit/937f359)), closes [#215](https://github.com/bustlelabs/mobiledoc-kit/issues/215)
* Match key commands to modifiers exactly ([8d2b95d](https://github.com/bustlelabs/mobiledoc-kit/commit/8d2b95d)), closes [#216](https://github.com/bustlelabs/mobiledoc-kit/issues/216)
* Merge pull request #218 from bustlelabs/select-all-215 ([0f26292](https://github.com/bustlelabs/mobiledoc-kit/commit/0f26292))
* Merge pull request #219 from bustlelabs/key-command-modifiers-216 ([57280b0](https://github.com/bustlelabs/mobiledoc-kit/commit/57280b0))
* Merge pull request #220 from mixonic/mobiledoc-kit ([ea2dd48](https://github.com/bustlelabs/mobiledoc-kit/commit/ea2dd48))
* Update Travis Badge in README ([aef72ba](https://github.com/bustlelabs/mobiledoc-kit/commit/aef72ba))



<a name="0.5.1"></a>
## 0.5.1 (2015-11-09)


* 0.5.1 ([132cf33](https://github.com/bustlelabs/mobiledoc-kit/commit/132cf33))
* Add cursor points at head and tail of cards ([ac4fac8](https://github.com/bustlelabs/mobiledoc-kit/commit/ac4fac8)), closes [#182](https://github.com/bustlelabs/mobiledoc-kit/issues/182)
* Add underline, subscript, superscript and strikethrough markup ([cae444c](https://github.com/bustlelabs/mobiledoc-kit/commit/cae444c))
* demo card with image ([2a7753a](https://github.com/bustlelabs/mobiledoc-kit/commit/2a7753a))
* fix createMarkup() example in post.js ([336ee8a](https://github.com/bustlelabs/mobiledoc-kit/commit/336ee8a))
* Fix demo input card for FF ([f6563f8](https://github.com/bustlelabs/mobiledoc-kit/commit/f6563f8))
* fix typo in Editor Lifecycle Hooks section of README ([193007c](https://github.com/bustlelabs/mobiledoc-kit/commit/193007c))
* Merge pull request #203 from bustlelabs/copy-paste-out-180 ([a6fcb27](https://github.com/bustlelabs/mobiledoc-kit/commit/a6fcb27))
* Merge pull request #204 from bustlelabs/cleanup ([b2b65f3](https://github.com/bustlelabs/mobiledoc-kit/commit/b2b65f3))
* Merge pull request #207 from vitosamson/master ([e5f1eb2](https://github.com/bustlelabs/mobiledoc-kit/commit/e5f1eb2))
* Merge pull request #209 from mixonic/one-word ([061ca48](https://github.com/bustlelabs/mobiledoc-kit/commit/061ca48))
* Merge pull request #210 from bustlelabs/remove-unused-parser ([01a6677](https://github.com/bustlelabs/mobiledoc-kit/commit/01a6677))
* Merge pull request #211 from vitosamson/master ([391878e](https://github.com/bustlelabs/mobiledoc-kit/commit/391878e))
* Merge pull request #214 from mixonic/card-cursors ([6bb42bf](https://github.com/bustlelabs/mobiledoc-kit/commit/6bb42bf))
* Merge pull request #217 from mixonic/vito-master ([1a66b0f](https://github.com/bustlelabs/mobiledoc-kit/commit/1a66b0f))
* Parse nbsp into spaces, render nbsp where needed ([6a95af5](https://github.com/bustlelabs/mobiledoc-kit/commit/6a95af5)), closes [#195](https://github.com/bustlelabs/mobiledoc-kit/issues/195)
* Remove Post parser, its reparse methods are  now in DOM parser ([cf45846](https://github.com/bustlelabs/mobiledoc-kit/commit/cf45846))
* Remove unused/deprecated code and css ([2f5eb4a](https://github.com/bustlelabs/mobiledoc-kit/commit/2f5eb4a))
* show text cursor instead of default cursor over the placeholder ([f7db993](https://github.com/bustlelabs/mobiledoc-kit/commit/f7db993))



<a name="0.5.0"></a>
# 0.5.0 (2015-11-02)


* 0.5.0 ([c7340f2](https://github.com/bustlelabs/mobiledoc-kit/commit/c7340f2))
* Better error messages when parsing bad mobiledoc ([7d67671](https://github.com/bustlelabs/mobiledoc-kit/commit/7d67671)), closes [#177](https://github.com/bustlelabs/mobiledoc-kit/issues/177)
* built website from 7774864980b6944edd755346044ff13f730fa299 ([e0b7e0e](https://github.com/bustlelabs/mobiledoc-kit/commit/e0b7e0e))
* built website from e0b7e0e0bf8326a7e56d8a2eed7052bc64e525cd ([28c57d7](https://github.com/bustlelabs/mobiledoc-kit/commit/28c57d7))
* Enable pasting html and text externally ([3556155](https://github.com/bustlelabs/mobiledoc-kit/commit/3556155)), closes [#180](https://github.com/bustlelabs/mobiledoc-kit/issues/180)
* Merge pull request #199 from bustlelabs/pasting-empty-content ([7774864](https://github.com/bustlelabs/mobiledoc-kit/commit/7774864))
* Merge pull request #200 from bustlelabs/cleanup ([437baaf](https://github.com/bustlelabs/mobiledoc-kit/commit/437baaf))
* Merge pull request #201 from bustlelabs/fix-website-script ([50fedb3](https://github.com/bustlelabs/mobiledoc-kit/commit/50fedb3))
* Merge pull request #202 from bustlelabs/better-parse-error-messages ([208d0e8](https://github.com/bustlelabs/mobiledoc-kit/commit/208d0e8))
* Paste improvements ([d4ce47a](https://github.com/bustlelabs/mobiledoc-kit/commit/d4ce47a)), closes [#196](https://github.com/bustlelabs/mobiledoc-kit/issues/196) [#190](https://github.com/bustlelabs/mobiledoc-kit/issues/190)
* Remove unused files, remove packages from package.json, docs ([fce0dc4](https://github.com/bustlelabs/mobiledoc-kit/commit/fce0dc4))
* update website build script, demo prod config ([7fbd438](https://github.com/bustlelabs/mobiledoc-kit/commit/7fbd438))



<a name="0.5.0-beta2"></a>
# 0.5.0-beta2 (2015-10-27)


* 0.5.0-beta2 ([ff395b6](https://github.com/bustlelabs/mobiledoc-kit/commit/ff395b6))
* Improve unknown card errors ([180172e](https://github.com/bustlelabs/mobiledoc-kit/commit/180172e))
* Merge pull request #188 from bustlelabs/parse-lists ([34ca437](https://github.com/bustlelabs/mobiledoc-kit/commit/34ca437))
* Merge pull request #197 from mixonic/improve-card-error ([caf8ffd](https://github.com/bustlelabs/mobiledoc-kit/commit/caf8ffd))
* Merge pull request #198 from mixonic/return-move ([9ae12f6](https://github.com/bustlelabs/mobiledoc-kit/commit/9ae12f6))
* Parse ul and ols correctly ([577b3db](https://github.com/bustlelabs/mobiledoc-kit/commit/577b3db)), closes [#183](https://github.com/bustlelabs/mobiledoc-kit/issues/183)
* Return "moved" sections ([5371529](https://github.com/bustlelabs/mobiledoc-kit/commit/5371529))



<a name="0.5.0-beta1"></a>
# 0.5.0-beta1 (2015-10-27)


* 0.5.0-beta1 ([4b1179a](https://github.com/bustlelabs/mobiledoc-kit/commit/4b1179a))
* Add `cardParsers` to SectionParser ([1c880f3](https://github.com/bustlelabs/mobiledoc-kit/commit/1c880f3))
* Enable CommonJS builds ([ad2e698](https://github.com/bustlelabs/mobiledoc-kit/commit/ad2e698))
* Fix demo updating on selection change ([051d267](https://github.com/bustlelabs/mobiledoc-kit/commit/051d267))
* Merge pull request #193 from bustlelabs/card-parsers ([5e52af8](https://github.com/bustlelabs/mobiledoc-kit/commit/5e52af8))
* Merge pull request #194 from mixonic/commonjs ([040f74e](https://github.com/bustlelabs/mobiledoc-kit/commit/040f74e))
* Update demo. Style active buttons, bump ember-content-kit ([8e3dde4](https://github.com/bustlelabs/mobiledoc-kit/commit/8e3dde4))



<a name="0.4.11"></a>
## 0.4.11 (2015-10-23)


* 0.4.11 ([2f4f1b6](https://github.com/bustlelabs/mobiledoc-kit/commit/2f4f1b6))
* Delete selection before applying paste ([ee22762](https://github.com/bustlelabs/mobiledoc-kit/commit/ee22762)), closes [#184](https://github.com/bustlelabs/mobiledoc-kit/issues/184)
* Merge pull request #185 from bustlelabs/paste-ignores-selection-184 ([25a4b0d](https://github.com/bustlelabs/mobiledoc-kit/commit/25a4b0d))



<a name="0.4.10"></a>
## 0.4.10 (2015-10-22)


* 0.4.10 ([b1080ae](https://github.com/bustlelabs/mobiledoc-kit/commit/b1080ae))
* execCommands for bold, italic without selection ([8855461](https://github.com/bustlelabs/mobiledoc-kit/commit/8855461))
* Handle cut/copy/paste events ([c2bbafe](https://github.com/bustlelabs/mobiledoc-kit/commit/c2bbafe)), closes [#111](https://github.com/bustlelabs/mobiledoc-kit/issues/111)
* Merge pull request #147 from bustlelabs/copy-paste-111 ([5f2dcfc](https://github.com/bustlelabs/mobiledoc-kit/commit/5f2dcfc))
* Merge pull request #179 from mixonic/stateful-bold-italic ([682dbac](https://github.com/bustlelabs/mobiledoc-kit/commit/682dbac))



<a name="0.4.9"></a>
## 0.4.9 (2015-10-20)


* 0.4.9 ([b76155b](https://github.com/bustlelabs/mobiledoc-kit/commit/b76155b))
* Merge pull request #178 from bustlelabs/remove-drag-drop-listeners ([5495bca](https://github.com/bustlelabs/mobiledoc-kit/commit/5495bca))
* Remove dragover, drop listeners ([29db470](https://github.com/bustlelabs/mobiledoc-kit/commit/29db470))



<a name="0.4.8"></a>
## 0.4.8 (2015-10-16)


* 0.4.8 ([e069b2e](https://github.com/bustlelabs/mobiledoc-kit/commit/e069b2e))
* Allow silent payload saving ([f041963](https://github.com/bustlelabs/mobiledoc-kit/commit/f041963))
* Drop the embed intent prompt ([edf3c26](https://github.com/bustlelabs/mobiledoc-kit/commit/edf3c26))
* Merge pull request #174 from mixonic/silent-save ([a1a6975](https://github.com/bustlelabs/mobiledoc-kit/commit/a1a6975))
* Merge pull request #176 from mixonic/drop-prompt ([3c56a47](https://github.com/bustlelabs/mobiledoc-kit/commit/3c56a47))



<a name="0.4.7"></a>
## 0.4.7 (2015-10-15)


* 0.4.7 ([ac3e6c5](https://github.com/bustlelabs/mobiledoc-kit/commit/ac3e6c5))
* Add editor#editCard and editor#displayCard ([2ef19f1](https://github.com/bustlelabs/mobiledoc-kit/commit/2ef19f1))
* Allow duplicate key commands to be registered ([0140bd9](https://github.com/bustlelabs/mobiledoc-kit/commit/0140bd9))
* built website from 0be1a85e810ef8c3f943b8dbb552dfd8faeed0a0 ([1c68846](https://github.com/bustlelabs/mobiledoc-kit/commit/1c68846))
* Fix bug when walkMarkerableSections ranges starts with card ([9d6266c](https://github.com/bustlelabs/mobiledoc-kit/commit/9d6266c))
* fixes shiftKey not being detected ([9d515e9](https://github.com/bustlelabs/mobiledoc-kit/commit/9d515e9))
* Initial display of mobiledoc and rendered DOM ([7761ecc](https://github.com/bustlelabs/mobiledoc-kit/commit/7761ecc)), closes [#163](https://github.com/bustlelabs/mobiledoc-kit/issues/163)
* Merge pull request #164 from mixonic/show-initial ([c552056](https://github.com/bustlelabs/mobiledoc-kit/commit/c552056))
* Merge pull request #165 from mixonic/fix-website ([e64872a](https://github.com/bustlelabs/mobiledoc-kit/commit/e64872a))
* Merge pull request #170 from bustlelabs/fix-walk-markerable-sections ([1364fb3](https://github.com/bustlelabs/mobiledoc-kit/commit/1364fb3))
* Merge pull request #172 from rlivsey/key-commands-refactor ([1be2d1d](https://github.com/bustlelabs/mobiledoc-kit/commit/1be2d1d))
* Merge pull request #173 from bustlelabs/card-initial-mode ([8b665f3](https://github.com/bustlelabs/mobiledoc-kit/commit/8b665f3))
* Register combo commands (“CTRL+X”) and allow special key names (“enter”) ([f6cfe26](https://github.com/bustlelabs/mobiledoc-kit/commit/f6cfe26))
* Registered key commands can override built-in functionality ([cbd6ec0](https://github.com/bustlelabs/mobiledoc-kit/commit/cbd6ec0))
* update README with details of key commands ([d3228b7](https://github.com/bustlelabs/mobiledoc-kit/commit/d3228b7))
* Update website build script for Ember ([0be1a85](https://github.com/bustlelabs/mobiledoc-kit/commit/0be1a85))



<a name="0.4.6"></a>
## 0.4.6 (2015-10-01)


* 0.4.6 ([cad7039](https://github.com/bustlelabs/mobiledoc-kit/commit/cad7039))
* Drop toolbars, migrate to Ember based demo ([bd63658](https://github.com/bustlelabs/mobiledoc-kit/commit/bd63658))
* Merge pull request #161 from mixonic/die-toolbar ([f3feeee](https://github.com/bustlelabs/mobiledoc-kit/commit/f3feeee))



<a name="0.4.5"></a>
## 0.4.5 (2015-09-24)


* 0.4.5 ([e738b32](https://github.com/bustlelabs/mobiledoc-kit/commit/e738b32))
* Drop addon ([9c775ff](https://github.com/bustlelabs/mobiledoc-kit/commit/9c775ff))
* Merge pull request #162 from mixonic/ember-content-kit ([5b080b7](https://github.com/bustlelabs/mobiledoc-kit/commit/5b080b7))



<a name="0.4.4"></a>
## 0.4.4 (2015-09-23)


* 0.4.4 ([973a1a2](https://github.com/bustlelabs/mobiledoc-kit/commit/973a1a2))
* Merge pull request #160 from bustlelabs/move-sections ([60ba942](https://github.com/bustlelabs/mobiledoc-kit/commit/60ba942))
* refactor post editor to use callbacks ([b53ae7a](https://github.com/bustlelabs/mobiledoc-kit/commit/b53ae7a))
* section#clone, postEditor#moveSectionBefore moveSectionUp moveSectionDown ([099bc21](https://github.com/bustlelabs/mobiledoc-kit/commit/099bc21))



<a name="0.4.3"></a>
## 0.4.3 (2015-09-23)


* 0.4.3 ([de3113d](https://github.com/bustlelabs/mobiledoc-kit/commit/de3113d))
* Add #detectMarkupInRange to editor ([93824a1](https://github.com/bustlelabs/mobiledoc-kit/commit/93824a1))
* applyMarkupToRange -> addMarkupToRange ([ded780b](https://github.com/bustlelabs/mobiledoc-kit/commit/ded780b))
* Merge pull request #159 from mixonic/detectRangeMarkup ([853a0d0](https://github.com/bustlelabs/mobiledoc-kit/commit/853a0d0))



<a name="0.4.2"></a>
## 0.4.2 (2015-09-22)


* 0.4.2 ([2a689a5](https://github.com/bustlelabs/mobiledoc-kit/commit/2a689a5))
* Add `cursorDidChange` lifecycle callback to editor ([cb20368](https://github.com/bustlelabs/mobiledoc-kit/commit/cb20368)), closes [#157](https://github.com/bustlelabs/mobiledoc-kit/issues/157)
* Handle a section of tagName "pull-quote" ([216cd9b](https://github.com/bustlelabs/mobiledoc-kit/commit/216cd9b)), closes [#153](https://github.com/bustlelabs/mobiledoc-kit/issues/153)
* Handle selecting sections when the passed array is empty ([f249a74](https://github.com/bustlelabs/mobiledoc-kit/commit/f249a74)), closes [#155](https://github.com/bustlelabs/mobiledoc-kit/issues/155)
* Merge pull request #154 from bustlelabs/pull-quote-section-153 ([561581a](https://github.com/bustlelabs/mobiledoc-kit/commit/561581a))
* Merge pull request #156 from bustlelabs/handle-selecting-0-sections-155 ([9ead5b3](https://github.com/bustlelabs/mobiledoc-kit/commit/9ead5b3))
* Merge pull request #158 from bustlelabs/cursor-moved-event-157 ([036c6d4](https://github.com/bustlelabs/mobiledoc-kit/commit/036c6d4))
* Update README.md ([5579169](https://github.com/bustlelabs/mobiledoc-kit/commit/5579169))



<a name="0.4.1"></a>
## 0.4.1 (2015-09-21)


* 0.4.1 ([0dd2d4c](https://github.com/bustlelabs/mobiledoc-kit/commit/0dd2d4c))
* Add docs for `registerKeyCommand` and `registerExpansion` editor methods ([a2df75e](https://github.com/bustlelabs/mobiledoc-kit/commit/a2df75e)), closes [#150](https://github.com/bustlelabs/mobiledoc-kit/issues/150)
* built website from 4e4662cf0315fd4c235d798a78857343be730bbc ([db764c6](https://github.com/bustlelabs/mobiledoc-kit/commit/db764c6))
* Merge pull request #151 from bustlelabs/docs-for-key-commands-and-text-expansions-150 ([b4485ec](https://github.com/bustlelabs/mobiledoc-kit/commit/b4485ec))
* Merge pull request #152 from bustlelabs/fix-sourcemap-concat ([db17051](https://github.com/bustlelabs/mobiledoc-kit/commit/db17051))
* upgrade to broccoli-multi-builder 0.2.8 ([ab5029e](https://github.com/bustlelabs/mobiledoc-kit/commit/ab5029e))



<a name="0.4.0"></a>
# 0.4.0 (2015-09-21)


* 0.4.0 ([4e4662c](https://github.com/bustlelabs/mobiledoc-kit/commit/4e4662c))
* add postEditor#splitSectionMarkerAtOffset ([6940ecd](https://github.com/bustlelabs/mobiledoc-kit/commit/6940ecd))
* Coalesce markers that have identical markups ([a83b176](https://github.com/bustlelabs/mobiledoc-kit/commit/a83b176))
* Fix all failing tests on Firefox ([e5b4763](https://github.com/bustlelabs/mobiledoc-kit/commit/e5b4763))
* fix firefox demo ([9c02250](https://github.com/bustlelabs/mobiledoc-kit/commit/9c02250))
* mark marker as dirty, not section, when applying or removing markup ([7d91956](https://github.com/bustlelabs/mobiledoc-kit/commit/7d91956))
* Merge pull request #145 from bustlelabs/block-format-post-editor ([243a465](https://github.com/bustlelabs/mobiledoc-kit/commit/243a465))
* Merge pull request #146 from bustlelabs/coalesce-similar-markers-v2 ([fe3d1ee](https://github.com/bustlelabs/mobiledoc-kit/commit/fe3d1ee))
* No need to coalesce markers for removed sections ([af39a5a](https://github.com/bustlelabs/mobiledoc-kit/commit/af39a5a))
* Use postEditor for block format commands ([0e4befd](https://github.com/bustlelabs/mobiledoc-kit/commit/0e4befd))



<a name="0.3.13"></a>
## 0.3.13 (2015-09-16)


* 0.3.13 ([0eb505b](https://github.com/bustlelabs/mobiledoc-kit/commit/0eb505b))
* Add postEditor#insertSection, #insertSectionAtEnd, #toggleMarkup ([5dffae5](https://github.com/bustlelabs/mobiledoc-kit/commit/5dffae5)), closes [#126](https://github.com/bustlelabs/mobiledoc-kit/issues/126)
* Do not show embed intent when editing is disabled ([0f18698](https://github.com/bustlelabs/mobiledoc-kit/commit/0f18698)), closes [#129](https://github.com/bustlelabs/mobiledoc-kit/issues/129)
* Do not show the placeholder text when editing is disabled ([03e404c](https://github.com/bustlelabs/mobiledoc-kit/commit/03e404c))
* Ensure that a markup can be applied to a range with a blank section ([7614af4](https://github.com/bustlelabs/mobiledoc-kit/commit/7614af4)), closes [#128](https://github.com/bustlelabs/mobiledoc-kit/issues/128)
* ensure we cache markups with attributes properly ([a46c26e](https://github.com/bustlelabs/mobiledoc-kit/commit/a46c26e)), closes [#140](https://github.com/bustlelabs/mobiledoc-kit/issues/140)
* Failing test for #134 ([db4c922](https://github.com/bustlelabs/mobiledoc-kit/commit/db4c922))
* Merge pull request #131 from bustlelabs/fix-list-item-selections-130 ([5d3c092](https://github.com/bustlelabs/mobiledoc-kit/commit/5d3c092))
* Merge pull request #133 from bustlelabs/fix-editor-dom-memory-leak-132 ([5b9cfad](https://github.com/bustlelabs/mobiledoc-kit/commit/5b9cfad))
* Merge pull request #136 from bustlelabs/fix-sections-contained-by-134 ([6e0d4d8](https://github.com/bustlelabs/mobiledoc-kit/commit/6e0d4d8))
* Merge pull request #138 from bustlelabs/fix-remove-markup-from-range-128 ([d4f34d2](https://github.com/bustlelabs/mobiledoc-kit/commit/d4f34d2))
* Merge pull request #139 from bustlelabs/add-insert-section-126 ([7600a1f](https://github.com/bustlelabs/mobiledoc-kit/commit/7600a1f))
* Merge pull request #141 from bustlelabs/fix-markup-cache-140 ([6d747b4](https://github.com/bustlelabs/mobiledoc-kit/commit/6d747b4))
* Merge pull request #142 from bustlelabs/embed-intent-hidden-when-editing-disabled-129 ([58b6c11](https://github.com/bustlelabs/mobiledoc-kit/commit/58b6c11))
* Merge pull request #143 from bustlelabs/hide-placeholder-disabled ([4624893](https://github.com/bustlelabs/mobiledoc-kit/commit/4624893))
* post#sectionsContainedBy returns [] when head section === tail section ([0a9fc7b](https://github.com/bustlelabs/mobiledoc-kit/commit/0a9fc7b)), closes [#134](https://github.com/bustlelabs/mobiledoc-kit/issues/134)
* Refactor EditorDom Renderer to ensure renderNodes are not leaked ([0b8f6c8](https://github.com/bustlelabs/mobiledoc-kit/commit/0b8f6c8)), closes [#132](https://github.com/bustlelabs/mobiledoc-kit/issues/132)
* Set the renderTree renderNode element for a list item ([7c192ed](https://github.com/bustlelabs/mobiledoc-kit/commit/7c192ed)), closes [#130](https://github.com/bustlelabs/mobiledoc-kit/issues/130)
* update release notes ([411ea90](https://github.com/bustlelabs/mobiledoc-kit/commit/411ea90))
* use `isBlank` in editor-dom renderer ([542e672](https://github.com/bustlelabs/mobiledoc-kit/commit/542e672))



<a name="0.3.12"></a>
## 0.3.12 (2015-09-15)


* 0.3.12 ([d3ecb8d](https://github.com/bustlelabs/mobiledoc-kit/commit/d3ecb8d))
* built website from 068db51a82c6c3d75ca9a5ef18a25e3d3fdc1db6 ([fa4c06c](https://github.com/bustlelabs/mobiledoc-kit/commit/fa4c06c))
* Handle blank mobiledoc in editor ([dca9722](https://github.com/bustlelabs/mobiledoc-kit/commit/dca9722)), closes [#125](https://github.com/bustlelabs/mobiledoc-kit/issues/125) [#35](https://github.com/bustlelabs/mobiledoc-kit/issues/35) [#71](https://github.com/bustlelabs/mobiledoc-kit/issues/71)
* Handle forward-delete in list items ([ae42ab2](https://github.com/bustlelabs/mobiledoc-kit/commit/ae42ab2)), closes [#118](https://github.com/bustlelabs/mobiledoc-kit/issues/118)
* Merge pull request #124 from bustlelabs/forward-delete-list-item-118 ([501ec53](https://github.com/bustlelabs/mobiledoc-kit/commit/501ec53))
* Merge pull request #127 from bustlelabs/placeholder-125 ([068db51](https://github.com/bustlelabs/mobiledoc-kit/commit/068db51))
* Refactor dom helpers, run some tests that were skipped in phantom ([e19dd6c](https://github.com/bustlelabs/mobiledoc-kit/commit/e19dd6c))
* Refactor into base Section class ([a8e19da](https://github.com/bustlelabs/mobiledoc-kit/commit/a8e19da))
* simplify Helpers.dom.getSelectedText() ([352c53c](https://github.com/bustlelabs/mobiledoc-kit/commit/352c53c))



<a name="0.3.11"></a>
## 0.3.11 (2015-09-10)


* 0.3.11 ([31f4b7a](https://github.com/bustlelabs/mobiledoc-kit/commit/31f4b7a))
* Add keyboard shortcuts via editor#registerKeyCommand ([f5487b0](https://github.com/bustlelabs/mobiledoc-kit/commit/f5487b0)), closes [#112](https://github.com/bustlelabs/mobiledoc-kit/issues/112)
* Fix bug in getting activeMarkers, use editor#markupsInSelection ([1c2fbab](https://github.com/bustlelabs/mobiledoc-kit/commit/1c2fbab)), closes [#119](https://github.com/bustlelabs/mobiledoc-kit/issues/119)
* Fix joining of previous section in postEditor when prev section is list ([fedb727](https://github.com/bustlelabs/mobiledoc-kit/commit/fedb727)), closes [#117](https://github.com/bustlelabs/mobiledoc-kit/issues/117)
* Merge pull request #116 from bustlelabs/keyboard-shortcuts-112 ([da2f078](https://github.com/bustlelabs/mobiledoc-kit/commit/da2f078))
* Merge pull request #120 from bustlelabs/bold-button-state-reflection-119 ([fa83c91](https://github.com/bustlelabs/mobiledoc-kit/commit/fa83c91))
* Merge pull request #122 from bustlelabs/un-exec-toolbar-121 ([f12f74c](https://github.com/bustlelabs/mobiledoc-kit/commit/f12f74c))
* Merge pull request #123 from bustlelabs/delete-start-of-section-117 ([ba7bdda](https://github.com/bustlelabs/mobiledoc-kit/commit/ba7bdda))
* Move command and button creation code out of editor.js ([fe72d5b](https://github.com/bustlelabs/mobiledoc-kit/commit/fe72d5b))
* Use post#markersContainedByRange in postEditor#splitMarkers ([63cb72a](https://github.com/bustlelabs/mobiledoc-kit/commit/63cb72a)), closes [#121](https://github.com/bustlelabs/mobiledoc-kit/issues/121)



<a name="0.3.10"></a>
## 0.3.10 (2015-09-08)


* 0.3.10 ([a5b6b50](https://github.com/bustlelabs/mobiledoc-kit/commit/a5b6b50))
* Add Post#sectionsContainedBy and update #walkMarkerableSections ([703ce12](https://github.com/bustlelabs/mobiledoc-kit/commit/703ce12)), closes [#108](https://github.com/bustlelabs/mobiledoc-kit/issues/108)
* Add post#walkMarkerableSections and make post.markersFor markerable-aware ([4b2ca18](https://github.com/bustlelabs/mobiledoc-kit/commit/4b2ca18)), closes [#102](https://github.com/bustlelabs/mobiledoc-kit/issues/102)
* bump mobiledoc-html-renderer dep ([58714d6](https://github.com/bustlelabs/mobiledoc-kit/commit/58714d6))
* bump to use mobiledoc-dom-renderer 0.1.12, with list support ([41e0605](https://github.com/bustlelabs/mobiledoc-kit/commit/41e0605))
* Cleanup listener code ([3d56c76](https://github.com/bustlelabs/mobiledoc-kit/commit/3d56c76))
* Create default markup section when hitting enter ([d348d06](https://github.com/bustlelabs/mobiledoc-kit/commit/d348d06))
* Detect when cursor is in card and ignore editor event listeners when so ([e6bfdef](https://github.com/bustlelabs/mobiledoc-kit/commit/e6bfdef)), closes [#114](https://github.com/bustlelabs/mobiledoc-kit/issues/114)
* Implement text expansions ([f598db8](https://github.com/bustlelabs/mobiledoc-kit/commit/f598db8)), closes [#87](https://github.com/bustlelabs/mobiledoc-kit/issues/87)
* Merge pull request #106 from bustlelabs/fix-link-command-98 ([a6659ef](https://github.com/bustlelabs/mobiledoc-kit/commit/a6659ef))
* Merge pull request #107 from bustlelabs/select-across-sections-102 ([f1bd948](https://github.com/bustlelabs/mobiledoc-kit/commit/f1bd948))
* Merge pull request #109 from bustlelabs/select-across-cards-108 ([15a6c7c](https://github.com/bustlelabs/mobiledoc-kit/commit/15a6c7c))
* Merge pull request #110 from bustlelabs/text-expansions ([4ea9e76](https://github.com/bustlelabs/mobiledoc-kit/commit/4ea9e76))
* Merge pull request #113 from bustlelabs/cleanup-listeners ([27cf9e2](https://github.com/bustlelabs/mobiledoc-kit/commit/27cf9e2))
* Merge pull request #115 from bustlelabs/ignore-event-listeners-in-cards-114 ([8334fba](https://github.com/bustlelabs/mobiledoc-kit/commit/8334fba))
* Remove extraneous arguments in toolbar/view logic ([f5871fc](https://github.com/bustlelabs/mobiledoc-kit/commit/f5871fc))
* Remove unnecessary `sync` call ([413144b](https://github.com/bustlelabs/mobiledoc-kit/commit/413144b))
* Simplify card editor-dom rendering ([a2a9969](https://github.com/bustlelabs/mobiledoc-kit/commit/a2a9969))



<a name="0.3.9"></a>
## 0.3.9 (2015-09-01)


* 0.3.9 ([b3d9cdb](https://github.com/bustlelabs/mobiledoc-kit/commit/b3d9cdb))
* Add #remove env hook to cards ([0787c17](https://github.com/bustlelabs/mobiledoc-kit/commit/0787c17)), closes [#104](https://github.com/bustlelabs/mobiledoc-kit/issues/104)
* Add ListSection, ListItem, bump MOBILEDOC_VERSION -> 0.2.0 ([44494f0](https://github.com/bustlelabs/mobiledoc-kit/commit/44494f0))
* Add prompt button, remove execCommand for links ([dcab0ad](https://github.com/bustlelabs/mobiledoc-kit/commit/dcab0ad)), closes [#98](https://github.com/bustlelabs/mobiledoc-kit/issues/98)
* allow trailing commas ([04cfdc7](https://github.com/bustlelabs/mobiledoc-kit/commit/04cfdc7))
* Catch render errors in demo and display the error ([789e252](https://github.com/bustlelabs/mobiledoc-kit/commit/789e252))
* Cleanup ([9fa15e4](https://github.com/bustlelabs/mobiledoc-kit/commit/9fa15e4))
* Drop all blank markers, section renders br ([787bd5a](https://github.com/bustlelabs/mobiledoc-kit/commit/787bd5a))
* Ensure we correctly use the markup cache when creating markups ([72cb5c6](https://github.com/bustlelabs/mobiledoc-kit/commit/72cb5c6)), closes [#80](https://github.com/bustlelabs/mobiledoc-kit/issues/80)
* Extract Markerable base class for ListItem and MarkupSection ([cab841a](https://github.com/bustlelabs/mobiledoc-kit/commit/cab841a))
* Introduce lifecycle hooks ([34104aa](https://github.com/bustlelabs/mobiledoc-kit/commit/34104aa))
* Merge pull request #100 from mixonic/die-blank-markers-die ([f38f229](https://github.com/bustlelabs/mobiledoc-kit/commit/f38f229))
* Merge pull request #103 from bustlelabs/cleanup ([758f8ff](https://github.com/bustlelabs/mobiledoc-kit/commit/758f8ff))
* Merge pull request #105 from bustlelabs/card-lifecycle-remove-hook-104 ([51e11bc](https://github.com/bustlelabs/mobiledoc-kit/commit/51e11bc))
* Merge pull request #94 from bustlelabs/lists-2 ([b57465d](https://github.com/bustlelabs/mobiledoc-kit/commit/b57465d))
* Merge pull request #95 from mixonic/lifecycle ([64e4367](https://github.com/bustlelabs/mobiledoc-kit/commit/64e4367))
* Merge pull request #99 from bustlelabs/cache-markups-properly-80 ([009039d](https://github.com/bustlelabs/mobiledoc-kit/commit/009039d))



<a name="0.3.8"></a>
## 0.3.8 (2015-08-26)


* 0.3.8 ([6f18a98](https://github.com/bustlelabs/mobiledoc-kit/commit/6f18a98))
* Fix clicking when there is no active cursor. ([48d372e](https://github.com/bustlelabs/mobiledoc-kit/commit/48d372e))
* Merge pull request #93 from mixonic/click-card ([3495f71](https://github.com/bustlelabs/mobiledoc-kit/commit/3495f71))



<a name="0.3.7"></a>
## 0.3.7 (2015-08-25)


* 0.3.7 ([7d93666](https://github.com/bustlelabs/mobiledoc-kit/commit/7d93666))
* built website from ced3b2b9e50e8a1c4be251e645a34a013135854f ([785641b](https://github.com/bustlelabs/mobiledoc-kit/commit/785641b))
* disabling content editable works before render ([3a2c416](https://github.com/bustlelabs/mobiledoc-kit/commit/3a2c416))
* Ensure that editor gets destroyed between tests ([b1d58d1](https://github.com/bustlelabs/mobiledoc-kit/commit/b1d58d1))
* Merge pull request #91 from bustlelabs/fix-leaks ([44f38d8](https://github.com/bustlelabs/mobiledoc-kit/commit/44f38d8))
* Merge pull request #92 from mixonic/disable-without-render ([13149c5](https://github.com/bustlelabs/mobiledoc-kit/commit/13149c5))



<a name="0.3.6"></a>
## 0.3.6 (2015-08-25)


* 0.3.5 ([c8aa07e](https://github.com/bustlelabs/mobiledoc-kit/commit/c8aa07e))
* 0.3.6 ([ced3b2b](https://github.com/bustlelabs/mobiledoc-kit/commit/ced3b2b))
* Add disableEditing, enableEditing ([22f723f](https://github.com/bustlelabs/mobiledoc-kit/commit/22f723f))
* built website from c83010e40c0ca020d10ce9ffa97044fcac435ca0 ([25ec47e](https://github.com/bustlelabs/mobiledoc-kit/commit/25ec47e))
* Merge pull request #82 from mixonic/disable-editing ([1aeb450](https://github.com/bustlelabs/mobiledoc-kit/commit/1aeb450))
* Merge pull request #89 from mixonic/split-out-render ([5449871](https://github.com/bustlelabs/mobiledoc-kit/commit/5449871))
* Merge pull request #90 from bustlelabs/fix-blank-markers ([97dedb9](https://github.com/bustlelabs/mobiledoc-kit/commit/97dedb9))
* Remove UNPRINTABLE_CHARACTER, use <br> instead ([a0d5566](https://github.com/bustlelabs/mobiledoc-kit/commit/a0d5566))
* simplify #markersFor ([ba7f1b9](https://github.com/bustlelabs/mobiledoc-kit/commit/ba7f1b9))
* Split render from editor instantiation ([6b05a4f](https://github.com/bustlelabs/mobiledoc-kit/commit/6b05a4f))



<a name="0.3.4"></a>
## 0.3.4 (2015-08-18)


* 0.3.4 ([f48a326](https://github.com/bustlelabs/mobiledoc-kit/commit/f48a326))
* Export BoldCommand ([53bfd64](https://github.com/bustlelabs/mobiledoc-kit/commit/53bfd64))



<a name="0.3.3"></a>
## 0.3.3 (2015-08-18)


* 0.3.3 ([b572547](https://github.com/bustlelabs/mobiledoc-kit/commit/b572547))
* Add `Key`, test for printable character on keydown when selection ([83deff5](https://github.com/bustlelabs/mobiledoc-kit/commit/83deff5)), closes [#50](https://github.com/bustlelabs/mobiledoc-kit/issues/50)
* Add forward and backward deletion to PostEditor ([cbb7182](https://github.com/bustlelabs/mobiledoc-kit/commit/cbb7182)), closes [#36](https://github.com/bustlelabs/mobiledoc-kit/issues/36)
* Add LinkedList#removeBy ([1cf6e59](https://github.com/bustlelabs/mobiledoc-kit/commit/1cf6e59))
* Correct the browser's reported selection ([1fbec9f](https://github.com/bustlelabs/mobiledoc-kit/commit/1fbec9f)), closes [#56](https://github.com/bustlelabs/mobiledoc-kit/issues/56)
* Docs for postEditor, editor.run, README ([aae4eda](https://github.com/bustlelabs/mobiledoc-kit/commit/aae4eda))
* Drop loadModel ([d1061eb](https://github.com/bustlelabs/mobiledoc-kit/commit/d1061eb))
* Handle newlines when there is a selection ([3b71056](https://github.com/bustlelabs/mobiledoc-kit/commit/3b71056)), closes [#49](https://github.com/bustlelabs/mobiledoc-kit/issues/49)
* Make getUserMedia work across browsers ([f9df470](https://github.com/bustlelabs/mobiledoc-kit/commit/f9df470))
* Merge pull request #67 from bustlelabs/fix-selection-issues-56 ([44ec6c9](https://github.com/bustlelabs/mobiledoc-kit/commit/44ec6c9))
* Merge pull request #69 from bustlelabs/trailing-space-68 ([ded8e43](https://github.com/bustlelabs/mobiledoc-kit/commit/ded8e43))
* Merge pull request #70 from bustlelabs/newlines-with-selection-49 ([44e12c3](https://github.com/bustlelabs/mobiledoc-kit/commit/44e12c3))
* Merge pull request #72 from bustlelabs/fix-linked-list ([6d4983d](https://github.com/bustlelabs/mobiledoc-kit/commit/6d4983d))
* Merge pull request #73 from mixonic/placeholder ([b7b9694](https://github.com/bustlelabs/mobiledoc-kit/commit/b7b9694))
* Merge pull request #74 from toddself/selfies-on-firefox ([cee6170](https://github.com/bustlelabs/mobiledoc-kit/commit/cee6170))
* Merge pull request #77 from bustlelabs/handle-keystroke-50 ([5c4ffa6](https://github.com/bustlelabs/mobiledoc-kit/commit/5c4ffa6))
* Merge pull request #78 from bustlelabs/leading-space-75 ([efe34f2](https://github.com/bustlelabs/mobiledoc-kit/commit/efe34f2))
* Merge pull request #83 from bustlelabs/forward-delete-v2-36 ([019814e](https://github.com/bustlelabs/mobiledoc-kit/commit/019814e))
* Merge pull request #85 from bustlelabs/remove-unused-markup-section-method ([16d774a](https://github.com/bustlelabs/mobiledoc-kit/commit/16d774a))
* Refactor image card to use postEditor ([b4db504](https://github.com/bustlelabs/mobiledoc-kit/commit/b4db504))
* Refactor newline insertion to use postEditor ([9a5c62e](https://github.com/bustlelabs/mobiledoc-kit/commit/9a5c62e))
* Refactor some method into public postEditor methods ([356468b](https://github.com/bustlelabs/mobiledoc-kit/commit/356468b))
* Remove unused MarkupSection#markerContaining ([44518f8](https://github.com/bustlelabs/mobiledoc-kit/commit/44518f8))
* remove unused MarkupSection#split ([c42329b](https://github.com/bustlelabs/mobiledoc-kit/commit/c42329b))
* Render a first marker with a leading space using NO_BREAK_SPACE ([f20a890](https://github.com/bustlelabs/mobiledoc-kit/commit/f20a890)), closes [#75](https://github.com/bustlelabs/mobiledoc-kit/issues/75)
* Render a last marker with trailing space using NO_BREAK_SPACE ([e1a5eda](https://github.com/bustlelabs/mobiledoc-kit/commit/e1a5eda)), closes [#68](https://github.com/bustlelabs/mobiledoc-kit/issues/68)
* rerender and didUpdate should be scheduled ([7e8a35c](https://github.com/bustlelabs/mobiledoc-kit/commit/7e8a35c))
* use triggerDelete instead of execCommand ([c0a84a9](https://github.com/bustlelabs/mobiledoc-kit/commit/c0a84a9))



<a name="0.3.2"></a>
## 0.3.2 (2015-08-12)


* 0.3.2 ([c6d544e](https://github.com/bustlelabs/mobiledoc-kit/commit/c6d544e))
* built website from 57aa456aea525555af553c5ce9359ba39cf54cee ([c404d3b](https://github.com/bustlelabs/mobiledoc-kit/commit/c404d3b))
* Ensure parsed mobiledocs have a blank marker ([e6f656c](https://github.com/bustlelabs/mobiledoc-kit/commit/e6f656c))
* Handle empty DOM nodes ([cfa4624](https://github.com/bustlelabs/mobiledoc-kit/commit/cfa4624))
* Merge pull request #66 from mixonic/empty ([fc700a1](https://github.com/bustlelabs/mobiledoc-kit/commit/fc700a1))



<a name="0.3.1"></a>
## 0.3.1 (2015-08-11)


* 0.3.1 ([57aa456](https://github.com/bustlelabs/mobiledoc-kit/commit/57aa456))
* built website from 059f4f3d6c14b18b38e3c7164301df893b638e04 ([cb8e11d](https://github.com/bustlelabs/mobiledoc-kit/commit/cb8e11d))
* Close markers properly in editor-dom renderer ([16569cb](https://github.com/bustlelabs/mobiledoc-kit/commit/16569cb))
* Ensure Marker#join returns a Marker with a builder ([19a30b3](https://github.com/bustlelabs/mobiledoc-kit/commit/19a30b3))
* Ensure that the editor triggers an update when clicking "heading" ([5344ca2](https://github.com/bustlelabs/mobiledoc-kit/commit/5344ca2)), closes [#58](https://github.com/bustlelabs/mobiledoc-kit/issues/58)
* isEmpty for linked list ([3dceea4](https://github.com/bustlelabs/mobiledoc-kit/commit/3dceea4))
* Merge pull request #59 from bustlelabs/update-dom-from-toolbar ([de62517](https://github.com/bustlelabs/mobiledoc-kit/commit/de62517))
* Merge pull request #60 from mixonic/ll-isEmpty ([f217898](https://github.com/bustlelabs/mobiledoc-kit/commit/f217898))
* Merge pull request #61 from bustlelabs/joined-marker-has-builder ([c57db03](https://github.com/bustlelabs/mobiledoc-kit/commit/c57db03))
* Merge pull request #62 from bustlelabs/is-empty-markers-and-sections ([a34b625](https://github.com/bustlelabs/mobiledoc-kit/commit/a34b625))
* Merge pull request #64 from mixonic/cloned-nodes-need-builder ([9812177](https://github.com/bustlelabs/mobiledoc-kit/commit/9812177))
* Merge pull request #65 from bustlelabs/overlapping-markers-63 ([57186e3](https://github.com/bustlelabs/mobiledoc-kit/commit/57186e3))
* Restore correct unprintable character ([462d9a7](https://github.com/bustlelabs/mobiledoc-kit/commit/462d9a7))
* Use `isEmpty` prop instead of `empty()` method on marker and section ([7c01249](https://github.com/bustlelabs/mobiledoc-kit/commit/7c01249))
* Use builder for marker clone ([41a8214](https://github.com/bustlelabs/mobiledoc-kit/commit/41a8214))



<a name="0.3.0"></a>
# 0.3.0 (2015-08-11)


* 0.3.0 ([059f4f3](https://github.com/bustlelabs/mobiledoc-kit/commit/059f4f3))
* Handle newline at start or end of section ([3f113b3](https://github.com/bustlelabs/mobiledoc-kit/commit/3f113b3)), closes [#39](https://github.com/bustlelabs/mobiledoc-kit/issues/39)
* Merge pull request #53 from bustlelabs/newline-at-section-start ([250a976](https://github.com/bustlelabs/mobiledoc-kit/commit/250a976))
* use a single loop ([d94aacb](https://github.com/bustlelabs/mobiledoc-kit/commit/d94aacb))



<a name="0.2.7"></a>
## 0.2.7 (2015-08-10)


* 0.2.7 ([b4efbef](https://github.com/bustlelabs/mobiledoc-kit/commit/b4efbef))
* Drop embed in favor of bustle cards ([237bf4a](https://github.com/bustlelabs/mobiledoc-kit/commit/237bf4a))
* Ensure multiple markup applications are rendered appropriately ([0687c83](https://github.com/bustlelabs/mobiledoc-kit/commit/0687c83))
* Merge pull request #48 from mixonic/ll ([e632b88](https://github.com/bustlelabs/mobiledoc-kit/commit/e632b88))
* Merge pull request #54 from mixonic/drop-embed ([89b4b5e](https://github.com/bustlelabs/mobiledoc-kit/commit/89b4b5e))
* Merge pull request #55 from bustlelabs/fix-multi-markup-application ([bcc7abe](https://github.com/bustlelabs/mobiledoc-kit/commit/bcc7abe))



<a name="0.2.6"></a>
## 0.2.6 (2015-08-10)


* 0.2.6 ([63474c8](https://github.com/bustlelabs/mobiledoc-kit/commit/63474c8))
* Add objectAt to linked-list ([b13be70](https://github.com/bustlelabs/mobiledoc-kit/commit/b13be70))
* Add splice method to linked list ([6e12e70](https://github.com/bustlelabs/mobiledoc-kit/commit/6e12e70))
* Drop custom list accessors/methods ([7731668](https://github.com/bustlelabs/mobiledoc-kit/commit/7731668))
* Merge pull request #52 from bustlelabs/markup-order-independence ([ff2a9c6](https://github.com/bustlelabs/mobiledoc-kit/commit/ff2a9c6))
* Port markers to linked list ([34945e8](https://github.com/bustlelabs/mobiledoc-kit/commit/34945e8))
* Port sections to a linked list ([8c6f343](https://github.com/bustlelabs/mobiledoc-kit/commit/8c6f343))
* takeRange -> readRange ([3503e5e](https://github.com/bustlelabs/mobiledoc-kit/commit/3503e5e))
* Use diff of prev/next marker's markups instead of assuming consistent order ([59b96ef](https://github.com/bustlelabs/mobiledoc-kit/commit/59b96ef)), closes [#51](https://github.com/bustlelabs/mobiledoc-kit/issues/51)



<a name="0.2.5"></a>
## 0.2.5 (2015-08-10)


* 0.2.5 ([c9bc65c](https://github.com/bustlelabs/mobiledoc-kit/commit/c9bc65c))
* Add tests for adopt and free item hooks ([4b9f37f](https://github.com/bustlelabs/mobiledoc-kit/commit/4b9f37f))
* Add toolbar test helpers, `triggerDelete` helper ([dd412c9](https://github.com/bustlelabs/mobiledoc-kit/commit/dd412c9))
* built website from 854dc54f2edeef21a938e6b6176c5aaa610e3db4 ([39fe494](https://github.com/bustlelabs/mobiledoc-kit/commit/39fe494))
* Handle different types of deletion ([9998dbb](https://github.com/bustlelabs/mobiledoc-kit/commit/9998dbb)), closes [#37](https://github.com/bustlelabs/mobiledoc-kit/issues/37)
* Initial linked list implementation ([3dd658e](https://github.com/bustlelabs/mobiledoc-kit/commit/3dd658e))
* Make broccoli-funnel a dep ([3883367](https://github.com/bustlelabs/mobiledoc-kit/commit/3883367))
* Merge pull request #46 from bustlelabs/37-selection-deletion ([de00376](https://github.com/bustlelabs/mobiledoc-kit/commit/de00376))
* Merge pull request #47 from mixonic/ll ([10f0f72](https://github.com/bustlelabs/mobiledoc-kit/commit/10f0f72))
* Port render nodes to use the linked list implementation ([d262593](https://github.com/bustlelabs/mobiledoc-kit/commit/d262593))
* Remove Marker.createBlank ([1c1f04b](https://github.com/bustlelabs/mobiledoc-kit/commit/1c1f04b))
* Use `triggerDelete` and remove some of the skipped-in-phantom tests ([433b783](https://github.com/bustlelabs/mobiledoc-kit/commit/433b783))



<a name="0.2.4"></a>
## 0.2.4 (2015-08-07)


### bugfix

* bugfix: Allow selecting across sections ([f89d346](https://github.com/bustlelabs/mobiledoc-kit/commit/f89d346))

* 0.2.4 ([854dc54](https://github.com/bustlelabs/mobiledoc-kit/commit/854dc54))
* Add .editorconfig & .gitignore additions ([875f7f4](https://github.com/bustlelabs/mobiledoc-kit/commit/875f7f4))
* Add `PostNodeBuilder`, remove post-builder, Markup.create ([ad9d9f9](https://github.com/bustlelabs/mobiledoc-kit/commit/ad9d9f9))
* Add Editor#applyMarkupToSelection, change bold command to use it ([f3e99c6](https://github.com/bustlelabs/mobiledoc-kit/commit/f3e99c6))
* Added Gitter badge ([be6d670](https://github.com/bustlelabs/mobiledoc-kit/commit/be6d670))
* built website from 4acc28b64b352ca2f4ea5fa99a1af42e35e7add8 ([b96d75e](https://github.com/bustlelabs/mobiledoc-kit/commit/b96d75e))
* change block commands to operate semantically, add ReversibleToolbarButton ([8ded94f](https://github.com/bustlelabs/mobiledoc-kit/commit/8ded94f))
* Change Italic command to operate semantically, Bold command uses "strong" tag ([d0c834c](https://github.com/bustlelabs/mobiledoc-kit/commit/d0c834c))
* Classify commands, change FormatBlock command to operate semantically ([3e7e829](https://github.com/bustlelabs/mobiledoc-kit/commit/3e7e829))
* Fix embed-intent ([b89d4fe](https://github.com/bustlelabs/mobiledoc-kit/commit/b89d4fe))
* Fix flexbox in Safari ([058155a](https://github.com/bustlelabs/mobiledoc-kit/commit/058155a))
* Fixes mobiledoc sample & removes jQuery from usage ([dc99c85](https://github.com/bustlelabs/mobiledoc-kit/commit/dc99c85))
* Ignore file with ENV for server ([845ab5d](https://github.com/bustlelabs/mobiledoc-kit/commit/845ab5d))
* Merge pull request #31 from mixonic/fix-embed-intent ([5ff0500](https://github.com/bustlelabs/mobiledoc-kit/commit/5ff0500))
* Merge pull request #32 from bustlelabs/refactor-editor ([58ffbc8](https://github.com/bustlelabs/mobiledoc-kit/commit/58ffbc8))
* Merge pull request #33 from mixonic/image-as-card ([36cc18a](https://github.com/bustlelabs/mobiledoc-kit/commit/36cc18a))
* Merge pull request #38 from bustlelabs/inline-commands ([23a13c2](https://github.com/bustlelabs/mobiledoc-kit/commit/23a13c2))
* Merge pull request #40 from bustlelabs/sourcemaps ([0f8ea7a](https://github.com/bustlelabs/mobiledoc-kit/commit/0f8ea7a))
* Merge pull request #41 from ErisDS/readme-fix ([39a0042](https://github.com/bustlelabs/mobiledoc-kit/commit/39a0042))
* Merge pull request #42 from gitter-badger/gitter-badge ([b9090f4](https://github.com/bustlelabs/mobiledoc-kit/commit/b9090f4))
* Merge pull request #45 from ErisDS/contrib-stuff ([a22b4d6](https://github.com/bustlelabs/mobiledoc-kit/commit/a22b4d6))
* Normalize tag names for sections ([1d16466](https://github.com/bustlelabs/mobiledoc-kit/commit/1d16466))
* Post images to be cards ([2b88550](https://github.com/bustlelabs/mobiledoc-kit/commit/2b88550))
* Refactor editor to delegate selection methods to `Cursor` ([674d399](https://github.com/bustlelabs/mobiledoc-kit/commit/674d399))
* Separate default and named imports (fixes confused syntax checker) ([897e35a](https://github.com/bustlelabs/mobiledoc-kit/commit/897e35a))
* Upgrade to broccoli-multi-builder 0.2.7 (brings sourcemaps) ([94f120d](https://github.com/bustlelabs/mobiledoc-kit/commit/94f120d))
* use element.classList ([75940ff](https://github.com/bustlelabs/mobiledoc-kit/commit/75940ff))
* Use normalizeTagName, Markup.create ([dcf686e](https://github.com/bustlelabs/mobiledoc-kit/commit/dcf686e))



<a name="0.2.3"></a>
## 0.2.3 (2015-07-31)


* 0.2.3 ([4acc28b](https://github.com/bustlelabs/mobiledoc-kit/commit/4acc28b))
* built website from 0cc1746c4433b9896e85fe3fbd17b760247b0bd7 ([97f42c6](https://github.com/bustlelabs/mobiledoc-kit/commit/97f42c6))
* changing to card display state triggers editor update ([4d0ad36](https://github.com/bustlelabs/mobiledoc-kit/commit/4d0ad36))
* Merge pull request #30 from bustlelabs/update-when-card-changes-state ([3e64c36](https://github.com/bustlelabs/mobiledoc-kit/commit/3e64c36))
* Update README.md ([60a5b77](https://github.com/bustlelabs/mobiledoc-kit/commit/60a5b77))



<a name="0.2.2"></a>
## 0.2.2 (2015-07-31)


* 0.2.2 ([0cc1746](https://github.com/bustlelabs/mobiledoc-kit/commit/0cc1746))
* change selfie demo to use `src` ([be00508](https://github.com/bustlelabs/mobiledoc-kit/commit/be00508))
* Clean up demo ([f49d483](https://github.com/bustlelabs/mobiledoc-kit/commit/f49d483))
* fix safari bug in demo.js ([1fa57e6](https://github.com/bustlelabs/mobiledoc-kit/commit/1fa57e6))
* Handle deletion (without selection) semantically ([5febfc4](https://github.com/bustlelabs/mobiledoc-kit/commit/5febfc4))
* Handle newline semantically, use special chars to denote text nodes and unprintable chars in editor  ([99824ba](https://github.com/bustlelabs/mobiledoc-kit/commit/99824ba))
* Merge pull request #28 from bustlelabs/markers-cory ([5028e64](https://github.com/bustlelabs/mobiledoc-kit/commit/5028e64))
* Update index.html ([f074dd4](https://github.com/bustlelabs/mobiledoc-kit/commit/f074dd4))
* Update README.md ([510faeb](https://github.com/bustlelabs/mobiledoc-kit/commit/510faeb))



<a name="0.2.1"></a>
## 0.2.1 (2015-07-29)


* 0.2.1 ([33d296a](https://github.com/bustlelabs/mobiledoc-kit/commit/33d296a))
* Add ember-addon functionality ([c1e4991](https://github.com/bustlelabs/mobiledoc-kit/commit/c1e4991))
* Tweak README ([878c877](https://github.com/bustlelabs/mobiledoc-kit/commit/878c877))



<a name="0.2.0"></a>
# 0.2.0 (2015-07-29)


### Test

* Test: displaying toolbar, clicking format butons, creating links ([9a10d7a](https://github.com/bustlelabs/mobiledoc-kit/commit/9a10d7a))

### WIP

* WIP: Add destroy to editor, make mobiledoc observable ([98075e8](https://github.com/bustlelabs/mobiledoc-kit/commit/98075e8))
* WIP: parse across section edits. TODO: handle deletion ([d062eab](https://github.com/bustlelabs/mobiledoc-kit/commit/d062eab))
* WIP: Start rewriting the demo ([43fd3c6](https://github.com/bustlelabs/mobiledoc-kit/commit/43fd3c6))

* 0.2.0 ([14dec35](https://github.com/bustlelabs/mobiledoc-kit/commit/14dec35))
* ability to get cursor index ([244b7b5](https://github.com/bustlelabs/mobiledoc-kit/commit/244b7b5))
* abstract auto typing text formatters ([f16e8b2](https://github.com/bustlelabs/mobiledoc-kit/commit/f16e8b2))
* add $ and QUnit to jshint globals ([710664f](https://github.com/bustlelabs/mobiledoc-kit/commit/710664f))
* Add a selfie card to the demo ([1e471f8](https://github.com/bustlelabs/mobiledoc-kit/commit/1e471f8))
* Add fixme ([89a60bc](https://github.com/bustlelabs/mobiledoc-kit/commit/89a60bc))
* add jquery ([006f74e](https://github.com/bustlelabs/mobiledoc-kit/commit/006f74e))
* Add Marker, Section, Section parser ([b757a3b](https://github.com/bustlelabs/mobiledoc-kit/commit/b757a3b))
* Add mobiledoc renderer test, fix tests ([d82b625](https://github.com/bustlelabs/mobiledoc-kit/commit/d82b625))
* Add more options to the demo, clean up its style and UI ([6b0c45a](https://github.com/bustlelabs/mobiledoc-kit/commit/6b0c45a))
* Add new renderer ([998c95a](https://github.com/bustlelabs/mobiledoc-kit/commit/998c95a))
* add npm scripts to build and deploy website ([205f169](https://github.com/bustlelabs/mobiledoc-kit/commit/205f169))
* add Post parser ([d83302d](https://github.com/bustlelabs/mobiledoc-kit/commit/d83302d))
* Add tests for parsers ([4a6edfb](https://github.com/bustlelabs/mobiledoc-kit/commit/4a6edfb))
* Added the ability to specify server url ([ea6f526](https://github.com/bustlelabs/mobiledoc-kit/commit/ea6f526))
* adding loadModel and model option ([c02edbe](https://github.com/bustlelabs/mobiledoc-kit/commit/c02edbe))
* Allow markers to determine if they closing or opening markup ([aec3812](https://github.com/bustlelabs/mobiledoc-kit/commit/aec3812))
* Assert that cards are rendered in the editor, and are noneditable ([27cd46e](https://github.com/bustlelabs/mobiledoc-kit/commit/27cd46e))
* basic test for pressing a letter in the editor ([f1372c5](https://github.com/bustlelabs/mobiledoc-kit/commit/f1372c5))
* Better server error messages ([aca842a](https://github.com/bustlelabs/mobiledoc-kit/commit/aca842a))
* breakup css files and build ([518ad4d](https://github.com/bustlelabs/mobiledoc-kit/commit/518ad4d))
* Bring in DOMRenderer from external dep mobiledoc-dom-renderer ([a78b990](https://github.com/bustlelabs/mobiledoc-kit/commit/a78b990))
* bug fix: embed intent hiding ([822d40a](https://github.com/bustlelabs/mobiledoc-kit/commit/822d40a))
* bug fix: positioning when resizing window while editing a link ([d8e6b3b](https://github.com/bustlelabs/mobiledoc-kit/commit/d8e6b3b))
* Build dist ([4d6e05f](https://github.com/bustlelabs/mobiledoc-kit/commit/4d6e05f))
* build with esperanto ([278e02c](https://github.com/bustlelabs/mobiledoc-kit/commit/278e02c))
* built website from 558499e7b0c5fbc76f554b3265f5a7dfb186d161 ([9512f1d](https://github.com/bustlelabs/mobiledoc-kit/commit/9512f1d))
* built website from 6b0c45a130fd3a96be7ccb8b7e7186c494c7dfed ([433947d](https://github.com/bustlelabs/mobiledoc-kit/commit/433947d))
* built website from b0933bfc8fc57aef1d2d68c9dd6d9bc1f28d1593 ([453856e](https://github.com/bustlelabs/mobiledoc-kit/commit/453856e))
* built website from bb36364c86f87721b6572f6e8adbe5ff2e8b2ca8 ([99372ee](https://github.com/bustlelabs/mobiledoc-kit/commit/99372ee))
* Bump for renderers to support cards ([055776e](https://github.com/bustlelabs/mobiledoc-kit/commit/055776e))
* Bump html renderer to support cards ([2e9f668](https://github.com/bustlelabs/mobiledoc-kit/commit/2e9f668))
* bundle the loader to simplify end-usage ([d4661eb](https://github.com/bustlelabs/mobiledoc-kit/commit/d4661eb))
* Cards docs ([ae07bfd](https://github.com/bustlelabs/mobiledoc-kit/commit/ae07bfd))
* change marker type to "marker", use "tagName" in markup ([875d31c](https://github.com/bustlelabs/mobiledoc-kit/commit/875d31c))
* change npm command to broccoli serve ([0a36660](https://github.com/bustlelabs/mobiledoc-kit/commit/0a36660))
* cleaner embed url settings ([6f0a1de](https://github.com/bustlelabs/mobiledoc-kit/commit/6f0a1de))
* cleaning up Editor constructor ([a0bedfa](https://github.com/bustlelabs/mobiledoc-kit/commit/a0bedfa))
* cleanup some complexity ([074f846](https://github.com/bustlelabs/mobiledoc-kit/commit/074f846))
* code cleanup and minor bug fixes ([d2121ac](https://github.com/bustlelabs/mobiledoc-kit/commit/d2121ac))
* combine contentEditable hacks ([0f157ea](https://github.com/bustlelabs/mobiledoc-kit/commit/0f157ea))
* compatibility fixes for IE10 ([9d9a530](https://github.com/bustlelabs/mobiledoc-kit/commit/9d9a530))
* compiler now included as npm dep.  Move embed renderers here instead of compiler ([d8496ac](https://github.com/bustlelabs/mobiledoc-kit/commit/d8496ac))
* Correct spelling ([db0d75e](https://github.com/bustlelabs/mobiledoc-kit/commit/db0d75e))
* cross-browser fixes, positioning bug fixes, code cleanup, update compiler ([2c4c1d4](https://github.com/bustlelabs/mobiledoc-kit/commit/2c4c1d4))
* crude image embeds ([84a634a](https://github.com/bustlelabs/mobiledoc-kit/commit/84a634a))
* crude oEmbed working ([7d523d4](https://github.com/bustlelabs/mobiledoc-kit/commit/7d523d4))
* destroy editor in demo before booting a new one ([5b59865](https://github.com/bustlelabs/mobiledoc-kit/commit/5b59865))
* display rendered HTML in the demo ([558499e](https://github.com/bustlelabs/mobiledoc-kit/commit/558499e))
* document building and deploying ([b7bdb12](https://github.com/bustlelabs/mobiledoc-kit/commit/b7bdb12))
* don't show toolbar when only selecting whitespace ([565f8b1](https://github.com/bustlelabs/mobiledoc-kit/commit/565f8b1))
* Drop compiler dependency ([45ce1f0](https://github.com/bustlelabs/mobiledoc-kit/commit/45ce1f0))
* editor 'selection', 'selectionUpdated', and 'selectionEnded' events ([53cc297](https://github.com/bustlelabs/mobiledoc-kit/commit/53cc297))
* eliminated constants file ([f4b6850](https://github.com/bustlelabs/mobiledoc-kit/commit/f4b6850))
* embed intent responsiveness and cleanup ([83a73ff](https://github.com/bustlelabs/mobiledoc-kit/commit/83a73ff))
* embed intents ([3bdb065](https://github.com/bustlelabs/mobiledoc-kit/commit/3bdb065))
* embed loading indicator ([ccd33c4](https://github.com/bustlelabs/mobiledoc-kit/commit/ccd33c4))
* embed toolbar, loading indication are now relative to embed intent view ([0a21ae7](https://github.com/bustlelabs/mobiledoc-kit/commit/0a21ae7))
* Enabled CORS on the server ([2f5e34d](https://github.com/bustlelabs/mobiledoc-kit/commit/2f5e34d))
* ensure floating toolbar always stays onscreen ([c3ea10d](https://github.com/bustlelabs/mobiledoc-kit/commit/c3ea10d))
* Ensure rendered editor dom closes markup tags ([12c20af](https://github.com/bustlelabs/mobiledoc-kit/commit/12c20af))
* ensure starting with an empty editor generates a block tag ([5e834d5](https://github.com/bustlelabs/mobiledoc-kit/commit/5e834d5))
* error messages ([941c829](https://github.com/bustlelabs/mobiledoc-kit/commit/941c829))
* es6 modules ([ac7b1f0](https://github.com/bustlelabs/mobiledoc-kit/commit/ac7b1f0))
* events ([8e870d6](https://github.com/bustlelabs/mobiledoc-kit/commit/8e870d6))
* explain how to deploy website in readme ([bb36364](https://github.com/bustlelabs/mobiledoc-kit/commit/bb36364))
* faster tagName lookups ([8542c4e](https://github.com/bustlelabs/mobiledoc-kit/commit/8542c4e))
* Fix bad import in editor-dom-test ([1ca3c56](https://github.com/bustlelabs/mobiledoc-kit/commit/1ca3c56))
* fix broken build ([e6996a1](https://github.com/bustlelabs/mobiledoc-kit/commit/e6996a1))
* fix bug in demo ([3900924](https://github.com/bustlelabs/mobiledoc-kit/commit/3900924))
* fix CSS and JS for safari and FF ([f95aa2b](https://github.com/bustlelabs/mobiledoc-kit/commit/f95aa2b))
* fix demo to run as local file without needing to start the server ([dfbbaac](https://github.com/bustlelabs/mobiledoc-kit/commit/dfbbaac))
* Fix dom renderer to render cards ([b0933bf](https://github.com/bustlelabs/mobiledoc-kit/commit/b0933bf))
* Fix failing test on Firefox due to non-deterministic attr ordering ([3976fd0](https://github.com/bustlelabs/mobiledoc-kit/commit/3976fd0))
* fix jshint failure ([d7705e5](https://github.com/bustlelabs/mobiledoc-kit/commit/d7705e5))
* handle failed images ([dd6614d](https://github.com/bustlelabs/mobiledoc-kit/commit/dd6614d))
* handle live update special cases (enter, backspace) ([f6b5d9d](https://github.com/bustlelabs/mobiledoc-kit/commit/f6b5d9d))
* Identify multiple selections and reparse them all ([0eb62f4](https://github.com/bustlelabs/mobiledoc-kit/commit/0eb62f4))
* idk heroku ([a7e39be](https://github.com/bustlelabs/mobiledoc-kit/commit/a7e39be))
* Ignore .env for AWS keys ([ed0410a](https://github.com/bustlelabs/mobiledoc-kit/commit/ed0410a))
* Ignore tmp/ ([27aed62](https://github.com/bustlelabs/mobiledoc-kit/commit/27aed62))
* image uploading ([4a48469](https://github.com/bustlelabs/mobiledoc-kit/commit/4a48469))
* importing content-kit-compiler from npm ([26cbd84](https://github.com/bustlelabs/mobiledoc-kit/commit/26cbd84))
* importing content-kit-utils from npm ([a820cbb](https://github.com/bustlelabs/mobiledoc-kit/commit/a820cbb))
* improve test helper's makeDOM ([f6a7c07](https://github.com/bustlelabs/mobiledoc-kit/commit/f6a7c07))
* improved text parsing ([a4129a0](https://github.com/bustlelabs/mobiledoc-kit/commit/a4129a0))
* improving design ([89e7be1](https://github.com/bustlelabs/mobiledoc-kit/commit/89e7be1))
* initial commit ([59e240e](https://github.com/bustlelabs/mobiledoc-kit/commit/59e240e))
* integrated upload/embed server directing into app ([8eeeb50](https://github.com/bustlelabs/mobiledoc-kit/commit/8eeeb50))
* integrating LESS ([6d69d9c](https://github.com/bustlelabs/mobiledoc-kit/commit/6d69d9c))
* Introduce cards ([ca43198](https://github.com/bustlelabs/mobiledoc-kit/commit/ca43198))
* link tooltips ([1bd3276](https://github.com/bustlelabs/mobiledoc-kit/commit/1bd3276))
* local image rendering ([df3de85](https://github.com/bustlelabs/mobiledoc-kit/commit/df3de85))
* Merge branch 'master' of https://github.com/ContentKit/content-kit-editor ([0396d21](https://github.com/bustlelabs/mobiledoc-kit/commit/0396d21))
* Merge branch 'master' of https://github.com/ContentKit/content-kit-editor ([ed3d0a0](https://github.com/bustlelabs/mobiledoc-kit/commit/ed3d0a0))
* Merge branch 'master' of https://github.com/ContentKit/content-kit-editor into enable-cors ([ffada0e](https://github.com/bustlelabs/mobiledoc-kit/commit/ffada0e))
* Merge branch 'server-url-addition' ([1294f4e](https://github.com/bustlelabs/mobiledoc-kit/commit/1294f4e))
* Merge pull request #1 from bustlelabs/enable-cors ([c630f85](https://github.com/bustlelabs/mobiledoc-kit/commit/c630f85))
* Merge pull request #10 from bustlelabs/use-broccoli-2 ([af71d2d](https://github.com/bustlelabs/mobiledoc-kit/commit/af71d2d))
* Merge pull request #11 from bustlelabs/use-test-builder ([39b0735](https://github.com/bustlelabs/mobiledoc-kit/commit/39b0735))
* Merge pull request #12 from bustlelabs/include-demo ([4193766](https://github.com/bustlelabs/mobiledoc-kit/commit/4193766))
* Merge pull request #14 from mixonic/drop-compiler ([ae79783](https://github.com/bustlelabs/mobiledoc-kit/commit/ae79783))
* Merge pull request #15 from mixonic/ref-mobiledoc ([d941d4f](https://github.com/bustlelabs/mobiledoc-kit/commit/d941d4f))
* Merge pull request #16 from bustlelabs/remove-gulp ([cd2dd88](https://github.com/bustlelabs/mobiledoc-kit/commit/cd2dd88))
* Merge pull request #17 from bustlelabs/editor-commands-tests ([d2f147c](https://github.com/bustlelabs/mobiledoc-kit/commit/d2f147c))
* Merge pull request #18 from bustlelabs/event-listeners ([0c25b1f](https://github.com/bustlelabs/mobiledoc-kit/commit/0c25b1f))
* Merge pull request #19 from bustlelabs/ie-10-compat ([f38c3fe](https://github.com/bustlelabs/mobiledoc-kit/commit/f38c3fe))
* Merge pull request #20 from bustlelabs/editor-section-tests ([59610b1](https://github.com/bustlelabs/mobiledoc-kit/commit/59610b1))
* Merge pull request #21 from mixonic/image-section ([82bcea7](https://github.com/bustlelabs/mobiledoc-kit/commit/82bcea7))
* Merge pull request #22 from bustlelabs/selection-event ([8e47fee](https://github.com/bustlelabs/mobiledoc-kit/commit/8e47fee))
* Merge pull request #23 from bustlelabs/markers ([95398a3](https://github.com/bustlelabs/mobiledoc-kit/commit/95398a3))
* Merge pull request #24 from bustlelabs/summertime ([ee2e1a4](https://github.com/bustlelabs/mobiledoc-kit/commit/ee2e1a4))
* Merge pull request #25 from mixonic/docs ([652d1bc](https://github.com/bustlelabs/mobiledoc-kit/commit/652d1bc))
* Merge pull request #26 from mixonic/card-docs ([ab56326](https://github.com/bustlelabs/mobiledoc-kit/commit/ab56326))
* Merge pull request #27 from bustlelabs/fix-editor-dom-rendering ([9d92d8a](https://github.com/bustlelabs/mobiledoc-kit/commit/9d92d8a))
* Merge pull request #29 from mixonic/mobiledoc-update ([c010686](https://github.com/bustlelabs/mobiledoc-kit/commit/c010686))
* Merge pull request #3 from ivarvong/patch-1 ([e4f52c0](https://github.com/bustlelabs/mobiledoc-kit/commit/e4f52c0))
* Merge pull request #7 from mixonic/cards ([0d190f4](https://github.com/bustlelabs/mobiledoc-kit/commit/0d190f4))
* Merge pull request #9 from bustlelabs/use-broccoli ([2e6f550](https://github.com/bustlelabs/mobiledoc-kit/commit/2e6f550))
* minor style cleanup of demo ([7bde2c7](https://github.com/bustlelabs/mobiledoc-kit/commit/7bde2c7))
* mobiledoc documentation ([b1b8bec](https://github.com/bustlelabs/mobiledoc-kit/commit/b1b8bec))
* more deploy goodies ([8cbfaab](https://github.com/bustlelabs/mobiledoc-kit/commit/8cbfaab))
* more embed intent ux fixes ([a6321a4](https://github.com/bustlelabs/mobiledoc-kit/commit/a6321a4))
* Move Section model to MarkupSection, use across codebase ([3c9465d](https://github.com/bustlelabs/mobiledoc-kit/commit/3c9465d))
* mucho trabajo ([2304dc3](https://github.com/bustlelabs/mobiledoc-kit/commit/2304dc3))
* new transpiler to remove amd ([874115f](https://github.com/bustlelabs/mobiledoc-kit/commit/874115f))
* Only reference runtime in demo ([1926c95](https://github.com/bustlelabs/mobiledoc-kit/commit/1926c95))
* overhaul gulp build system. Include compiler in build ([3105470](https://github.com/bustlelabs/mobiledoc-kit/commit/3105470))
* overhaul gulp build system. Include compiler in build ([5e39bb2](https://github.com/bustlelabs/mobiledoc-kit/commit/5e39bb2))
* parse dom node, not innerHTML ([e77c366](https://github.com/bustlelabs/mobiledoc-kit/commit/e77c366))
* Pass version number and sections payload on mobiledocs ([148735b](https://github.com/bustlelabs/mobiledoc-kit/commit/148735b))
* Post nodes no longer store closed and open, but all their markups ([0f69dc1](https://github.com/bustlelabs/mobiledoc-kit/commit/0f69dc1))
* prepping embeds for interactive editing. ([40937bd](https://github.com/bustlelabs/mobiledoc-kit/commit/40937bd))
* Prototype serializer for posts ([18ba2a0](https://github.com/bustlelabs/mobiledoc-kit/commit/18ba2a0))
* publish builds ([4e9dcd0](https://github.com/bustlelabs/mobiledoc-kit/commit/4e9dcd0))
* Re-use card blocks from a previous render ([6dd5a69](https://github.com/bustlelabs/mobiledoc-kit/commit/6dd5a69))
* README tweaks for website deploy ([dcfcade](https://github.com/bustlelabs/mobiledoc-kit/commit/dcfcade))
* README updates ([3e57efc](https://github.com/bustlelabs/mobiledoc-kit/commit/3e57efc))
* Refactor Image and Card sections to a new renderer ([67c2e0d](https://github.com/bustlelabs/mobiledoc-kit/commit/67c2e0d))
* Remove CORS ([3c084ce](https://github.com/bustlelabs/mobiledoc-kit/commit/3c084ce))
* remove heroku postinstall script ([497df98](https://github.com/bustlelabs/mobiledoc-kit/commit/497df98))
* remove some unused code ([a9f7f02](https://github.com/bustlelabs/mobiledoc-kit/commit/a9f7f02))
* remove unused ember-cli-test-loader bower component ([3bc230a](https://github.com/bustlelabs/mobiledoc-kit/commit/3bc230a))
* Removes gulp dependencies ([422f987](https://github.com/bustlelabs/mobiledoc-kit/commit/422f987))
* revert some experimental code ([acad7cb](https://github.com/bustlelabs/mobiledoc-kit/commit/acad7cb))
* sample cards: simple, edit, input ([6a440dc](https://github.com/bustlelabs/mobiledoc-kit/commit/6a440dc))
* screenshot ([ec7b780](https://github.com/bustlelabs/mobiledoc-kit/commit/ec7b780))
* section has type='section' and tagName property ([e6509e4](https://github.com/bustlelabs/mobiledoc-kit/commit/e6509e4))
* serverUrl property changed to serverHost ([2843105](https://github.com/bustlelabs/mobiledoc-kit/commit/2843105))
* Show innerHTML (with | between text nodes) of editor in demo ([5e25491](https://github.com/bustlelabs/mobiledoc-kit/commit/5e25491))
* simplify animations ([7ff5fa6](https://github.com/bustlelabs/mobiledoc-kit/commit/7ff5fa6))
* skip link test in phantomjs ([7557d43](https://github.com/bustlelabs/mobiledoc-kit/commit/7557d43))
* Small formatting cleanup ([0589f3c](https://github.com/bustlelabs/mobiledoc-kit/commit/0589f3c))
* Specify libDirName for testTreeBuilder ([9bf4ab0](https://github.com/bustlelabs/mobiledoc-kit/commit/9bf4ab0))
* start live update ([1e5b1cf](https://github.com/bustlelabs/mobiledoc-kit/commit/1e5b1cf))
* sticky toolbar support ([8ec1188](https://github.com/bustlelabs/mobiledoc-kit/commit/8ec1188))
* stub drag and drop ([76e465c](https://github.com/bustlelabs/mobiledoc-kit/commit/76e465c))
* style touchups ([7752de9](https://github.com/bustlelabs/mobiledoc-kit/commit/7752de9))
* support for pasting markup ([bf5b57f](https://github.com/bustlelabs/mobiledoc-kit/commit/bf5b57f))
* Test that editor can accept mobiledoc format and render it ([06def74](https://github.com/bustlelabs/mobiledoc-kit/commit/06def74))
* Tests for creating/deleting sections ([dafdee5](https://github.com/bustlelabs/mobiledoc-kit/commit/dafdee5))
* Text fixes ([86651c0](https://github.com/bustlelabs/mobiledoc-kit/commit/86651c0))
* toolbar cleanup ([bc947fa](https://github.com/bustlelabs/mobiledoc-kit/commit/bc947fa))
* Tweak docs to show booting node server ([6261c7c](https://github.com/bustlelabs/mobiledoc-kit/commit/6261c7c))
* Tweak README ([d6f9ca8](https://github.com/bustlelabs/mobiledoc-kit/commit/d6f9ca8))
* typo fix ([a2bbf96](https://github.com/bustlelabs/mobiledoc-kit/commit/a2bbf96))
* Typo fix ([f09e33a](https://github.com/bustlelabs/mobiledoc-kit/commit/f09e33a))
* update compiler ([216fd3f](https://github.com/bustlelabs/mobiledoc-kit/commit/216fd3f))
* update compiler, update demo code pane ux ([f830621](https://github.com/bustlelabs/mobiledoc-kit/commit/f830621))
* update config setup ([3b0c57f](https://github.com/bustlelabs/mobiledoc-kit/commit/3b0c57f))
* update demo, add compat layer for win/doc, compile LESS ([3c505d7](https://github.com/bustlelabs/mobiledoc-kit/commit/3c505d7))
* Update editor to parse the DOM to the post AT ([e59eaf7](https://github.com/bustlelabs/mobiledoc-kit/commit/e59eaf7))
* Update index.html ([81b5649](https://github.com/bustlelabs/mobiledoc-kit/commit/81b5649))
* Update LICENSE year, owners ([442740f](https://github.com/bustlelabs/mobiledoc-kit/commit/442740f))
* Update MOBILEDOC.md ([e9a5d42](https://github.com/bustlelabs/mobiledoc-kit/commit/e9a5d42))
* Update README ([9d417f0](https://github.com/bustlelabs/mobiledoc-kit/commit/9d417f0))
* Update README.md ([504adbe](https://github.com/bustlelabs/mobiledoc-kit/commit/504adbe))
* Update README.md ([0b9222d](https://github.com/bustlelabs/mobiledoc-kit/commit/0b9222d))
* Update renderers ([f775642](https://github.com/bustlelabs/mobiledoc-kit/commit/f775642))
* update server stuff ([3a01391](https://github.com/bustlelabs/mobiledoc-kit/commit/3a01391))
* update to work with broccoli multi builder 0.2.2, bring in loader.js to tests ([a0c5c56](https://github.com/bustlelabs/mobiledoc-kit/commit/a0c5c56))
* use broccoli-multi-builder to output amd, globals, cjs ([35f34c8](https://github.com/bustlelabs/mobiledoc-kit/commit/35f34c8))
* Use broccoli-test-builder and fix jshint failures ([59d103c](https://github.com/bustlelabs/mobiledoc-kit/commit/59d103c))
* use content-kit-compiler 0.3.1 ([2613387](https://github.com/bustlelabs/mobiledoc-kit/commit/2613387))
* Use custom IE flexbox CSS for demo ([2839ce5](https://github.com/bustlelabs/mobiledoc-kit/commit/2839ce5))
* use ENV vars instead of config.json for api keys; setup for deploy ([7510ee0](https://github.com/bustlelabs/mobiledoc-kit/commit/7510ee0))
* use EventListener mixin to ensure listeners are destroyed by views ([9ef8f59](https://github.com/bustlelabs/mobiledoc-kit/commit/9ef8f59))
* use markup model ([63b8fbf](https://github.com/bustlelabs/mobiledoc-kit/commit/63b8fbf))
* Use phantomjs at travis ([6e30ac8](https://github.com/bustlelabs/mobiledoc-kit/commit/6e30ac8))
* Use runtime renderer in demo ([8213e30](https://github.com/bustlelabs/mobiledoc-kit/commit/8213e30))
* use testem for tests ([532c974](https://github.com/bustlelabs/mobiledoc-kit/commit/532c974))
* using tags from compiler ([19a2464](https://github.com/bustlelabs/mobiledoc-kit/commit/19a2464))
* View class abstraction and code cleanup ([2a3b093](https://github.com/bustlelabs/mobiledoc-kit/commit/2a3b093))
* wooo ([c74e6a2](https://github.com/bustlelabs/mobiledoc-kit/commit/c74e6a2))
* youtube embeds ([028f3ba](https://github.com/bustlelabs/mobiledoc-kit/commit/028f3ba))
* z-index management. better messages UI ([817166c](https://github.com/bustlelabs/mobiledoc-kit/commit/817166c))



