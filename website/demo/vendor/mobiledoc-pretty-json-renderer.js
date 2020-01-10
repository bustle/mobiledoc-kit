var mobiledocPrettyJSONRenderer =
/******/function (modules) {
	// webpackBootstrap
	/******/ // The module cache
	/******/var installedModules = {};

	/******/ // The require function
	/******/function __webpack_require__(moduleId) {

		/******/ // Check if module is in cache
		/******/if (installedModules[moduleId])
			/******/return installedModules[moduleId].exports;

		/******/ // Create a new module (and put it into the cache)
		/******/var module = installedModules[moduleId] = {
			/******/exports: {},
			/******/id: moduleId,
			/******/loaded: false
			/******/ };

		/******/ // Execute the module function
		/******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		/******/ // Flag the module as loaded
		/******/module.loaded = true;

		/******/ // Return the exports of the module
		/******/return module.exports;
		/******/
	}

	/******/ // expose the modules object (__webpack_modules__)
	/******/__webpack_require__.m = modules;

	/******/ // expose the module cache
	/******/__webpack_require__.c = installedModules;

	/******/ // __webpack_public_path__
	/******/__webpack_require__.p = "";

	/******/ // Load entry module and return exports
	/******/return __webpack_require__(0);
	/******/
}(
/************************************************************************/
/******/[
/* 0 */
/***/function (module, exports, __webpack_require__) {

	var utils = __webpack_require__(1);
	var formatters = __webpack_require__(2);

	module.exports = function formatMobiledoc(doc) {
		if (doc == null || typeof doc === 'string') {
			return JSON.stringify(doc);
		}
		if (doc.version && doc.version.indexOf('0.3') === 0) {
			return JSON.stringify(doc, null, 2);
		}
		var lists = [{
			key: 'markups',
			formatter: formatters.markup
		}, {
			key: 'atoms',
			formatter: formatters.atom
		}, {
			key: 'cards',
			formatter: formatters.card
		}, {
			key: 'sections',
			formatter: formatters.section
		}];
		var pairs = [];
		lists.forEach(function (list) {
			var key = list.key;
			if (doc[key]) {
				pairs.push({
					key: key,
					value: utils.multiLineArray(doc[key].map(list.formatter))
				});
			}
		});
		if (doc.version) {
			pairs.unshift({
				key: 'version',
				value: formatters.version(doc.version)
			});
		}
		var block = utils.indent(pairs.map(function (pair) {
			return JSON.stringify(pair.key) + ': ' + pair.value;
		}).join(',\n'), 2);
		return '{\n' + block + '\n}';
	};

	/***/
},
/* 1 */
/***/function (module, exports) {

	function indent(multiline, depth) {
		var indent = [];
		while (depth > 0) {
			indent.push(' ');
			depth--;
		}
		indent = indent.join('');
		return multiline.replace(/^/gm, indent);
	}

	function around(inner) {
		return '[' + inner + ']';
	}

	function prettyJSON(obj) {
		return JSON.stringify(obj, null, '  ');
	}

	function oneline(obj) {
		if (Array.isArray(obj)) {
			return around(obj.map(oneline).join(', '));
		} else {
			return JSON.stringify(obj);
		}
	}

	function multiLineArray(items) {
		if (items.length) {
			var block = indent(items.join(',\n'), 2);
			return '[\n' + block + '\n]';
		} else {
			return '[]';
		}
	}

	module.exports = {
		indent: indent,
		around: around,
		prettyJSON: prettyJSON,
		oneline: oneline,
		multiLineArray: multiLineArray
	};

	/***/
},
/* 2 */
/***/function (module, exports, __webpack_require__) {

	var utils = __webpack_require__(1);
	var stringify = JSON.stringify;

	function version(version) {
		return stringify(version);
	}

	function atom(atom) {
		atom = atom.slice();
		var name = atom[0],
		    textContent = atom[1],
		    atomPayload = atom[2];
		atom[0] = stringify(name);
		atom[1] = stringify(textContent);
		if (atomPayload) {
			atom[2] = utils.prettyJSON(atomPayload);
		}
		return utils.around(atom.join(', '));
	}

	function card(card) {
		card = card.slice();
		var name = card[0],
		    payload = card[1];
		card[0] = stringify(name);
		if (payload) {
			card[1] = utils.prettyJSON(payload);
		}
		return utils.around(card.join(', '));
	}

	function section(section) {
		section = section.slice();
		var type = section[0],
		    tagOrCardIndex = section[1],
		    markers = section[2];
		if (type != null) {
			section[0] = stringify(type);
		}
		if (tagOrCardIndex != null) {
			section[1] = stringify(tagOrCardIndex);
		}
		if (markers) {
			section[2] = utils.multiLineArray(markers.map(utils.oneline));
		}
		return utils.around(section.join(', '));
	}

	module.exports = {
		version: version,
		markup: utils.oneline,
		atom: atom,
		card: card,
		section: section
	};

	/***/
}
/******/]);