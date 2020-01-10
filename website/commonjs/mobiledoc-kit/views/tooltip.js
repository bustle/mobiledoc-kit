'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _view = require('./view');

var _utilsElementUtils = require('../utils/element-utils');

var DELAY = 200;

var Tooltip = (function (_View) {
  _inherits(Tooltip, _View);

  function Tooltip(options) {
    var _this = this;

    _classCallCheck(this, Tooltip);

    var rootElement = options.rootElement;

    var timeout = undefined;
    options.classNames = ['__mobiledoc-tooltip'];
    _get(Object.getPrototypeOf(Tooltip.prototype), 'constructor', this).call(this, options);

    this.addEventListener(rootElement, 'mouseover', function (e) {
      var target = (0, _utilsElementUtils.getEventTargetMatchingTag)(options.showForTag, e.target, rootElement);
      if (target && target.isContentEditable) {
        timeout = setTimeout(function () {
          _this.showLink(target.href, target);
        }, DELAY);
      }
    });

    this.addEventListener(rootElement, 'mouseout', function (e) {
      clearTimeout(timeout);
      if (_this.elementObserver) {
        _this.elementObserver.cancel();
      }
      var toElement = e.toElement || e.relatedTarget;
      if (toElement && toElement.className !== _this.element.className) {
        _this.hide();
      }
    });
  }

  _createClass(Tooltip, [{
    key: 'showMessage',
    value: function showMessage(message, element) {
      var tooltipElement = this.element;
      tooltipElement.innerHTML = message;
      this.show();
      (0, _utilsElementUtils.positionElementCenteredBelow)(tooltipElement, element);
    }
  }, {
    key: 'showLink',
    value: function showLink(link, element) {
      var _this2 = this;

      var message = '<a href="' + link + '" target="_blank">' + link + '</a>';
      this.showMessage(message, element);
      this.elementObserver = (0, _utilsElementUtils.whenElementIsNotInDOM)(element, function () {
        return _this2.hide();
      });
    }
  }]);

  return Tooltip;
})(_view['default']);

exports['default'] = Tooltip;