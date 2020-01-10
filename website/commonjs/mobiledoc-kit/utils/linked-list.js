'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('./assert');

var PARENT_PROP = '__parent';

var LinkedList = (function () {
  function LinkedList(options) {
    _classCallCheck(this, LinkedList);

    this.head = null;
    this.tail = null;
    this.length = 0;

    if (options) {
      var adoptItem = options.adoptItem;
      var freeItem = options.freeItem;

      this._adoptItem = adoptItem;
      this._freeItem = freeItem;
    }
  }

  _createClass(LinkedList, [{
    key: 'adoptItem',
    value: function adoptItem(item) {
      item[PARENT_PROP] = this;
      this.length++;
      if (this._adoptItem) {
        this._adoptItem(item);
      }
    }
  }, {
    key: 'freeItem',
    value: function freeItem(item) {
      item[PARENT_PROP] = null;
      this.length--;
      if (this._freeItem) {
        this._freeItem(item);
      }
    }
  }, {
    key: 'prepend',
    value: function prepend(item) {
      this.insertBefore(item, this.head);
    }
  }, {
    key: 'append',
    value: function append(item) {
      this.insertBefore(item, null);
    }
  }, {
    key: 'insertAfter',
    value: function insertAfter(item, prevItem) {
      var nextItem = prevItem ? prevItem.next : this.head;
      this.insertBefore(item, nextItem);
    }
  }, {
    key: '_ensureItemIsNotAlreadyInList',
    value: function _ensureItemIsNotAlreadyInList(item) {
      (0, _assert['default'])('Cannot insert an item into a list if it is already in a list', !item.next && !item.prev && this.head !== item);
    }
  }, {
    key: 'insertBefore',
    value: function insertBefore(item, nextItem) {
      this._ensureItemIsNotInList(item);
      this.adoptItem(item);

      var insertPos = undefined;
      if (nextItem && nextItem.prev) {
        insertPos = 'middle';
      } else if (nextItem) {
        insertPos = 'start';
      } else {
        insertPos = 'end';
      }

      switch (insertPos) {
        case 'start':
          if (this.head) {
            item.next = this.head;
            this.head.prev = item;
          }
          this.head = item;

          break;
        case 'middle':
          {
            var prevItem = nextItem.prev;
            item.next = nextItem;
            item.prev = prevItem;
            nextItem.prev = item;
            prevItem.next = item;

            break;
          }
        case 'end':
          {
            var tail = this.tail;
            item.prev = tail;

            if (tail) {
              tail.next = item;
            } else {
              this.head = item;
            }
            this.tail = item;

            break;
          }
      }
    }
  }, {
    key: 'remove',
    value: function remove(item) {
      if (!item[PARENT_PROP]) {
        return;
      }
      this._ensureItemIsInThisList(item);
      this.freeItem(item);

      var prev = item.prev;
      var next = item.next;

      item.prev = null;
      item.next = null;

      if (prev) {
        prev.next = next;
      } else {
        this.head = next;
      }

      if (next) {
        next.prev = prev;
      } else {
        this.tail = prev;
      }
    }
  }, {
    key: 'forEach',
    value: function forEach(callback) {
      var item = this.head;
      var index = 0;
      while (item) {
        callback(item, index++);
        item = item.next;
      }
    }
  }, {
    key: 'map',
    value: function map(callback) {
      var result = [];
      this.forEach(function (i) {
        return result.push(callback(i));
      });
      return result;
    }
  }, {
    key: 'walk',
    value: function walk(startItem, endItem, callback) {
      var item = startItem || this.head;
      while (item) {
        callback(item);
        if (item === endItem) {
          break;
        }
        item = item.next;
      }
    }
  }, {
    key: 'readRange',
    value: function readRange(startItem, endItem) {
      var items = [];
      this.walk(startItem, endItem, function (item) {
        items.push(item);
      });
      return items;
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return this.readRange();
    }
  }, {
    key: 'detect',
    value: function detect(callback) {
      var item = arguments.length <= 1 || arguments[1] === undefined ? this.head : arguments[1];
      var reverse = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      while (item) {
        if (callback(item)) {
          return item;
        }
        item = reverse ? item.prev : item.next;
      }
    }
  }, {
    key: 'any',
    value: function any(callback) {
      return !!this.detect(callback);
    }
  }, {
    key: 'every',
    value: function every(callback) {
      var item = this.head;
      while (item) {
        if (!callback(item)) {
          return false;
        }
        item = item.next;
      }
      return true;
    }
  }, {
    key: 'objectAt',
    value: function objectAt(targetIndex) {
      var index = -1;
      return this.detect(function () {
        index++;
        return targetIndex === index;
      });
    }
  }, {
    key: 'splice',
    value: function splice(targetItem, removalCount, newItems) {
      var _this = this;

      var item = targetItem;
      var nextItem = item.next;
      var count = 0;
      while (item && count < removalCount) {
        count++;
        nextItem = item.next;
        this.remove(item);
        item = nextItem;
      }
      newItems.forEach(function (newItem) {
        _this.insertBefore(newItem, nextItem);
      });
    }
  }, {
    key: 'removeBy',
    value: function removeBy(conditionFn) {
      var item = this.head;
      while (item) {
        var nextItem = item.next;

        if (conditionFn(item)) {
          this.remove(item);
        }

        item = nextItem;
      }
    }
  }, {
    key: '_ensureItemIsNotInList',
    value: function _ensureItemIsNotInList(item) {
      (0, _assert['default'])('Cannot insert an item into a list if it is already in a list', !item[PARENT_PROP]);
    }
  }, {
    key: '_ensureItemIsInThisList',
    value: function _ensureItemIsInThisList(item) {
      (0, _assert['default'])('Cannot remove item that is in another list', item[PARENT_PROP] === this);
    }
  }, {
    key: 'isEmpty',
    get: function get() {
      return this.length === 0;
    }
  }]);

  return LinkedList;
})();

exports['default'] = LinkedList;