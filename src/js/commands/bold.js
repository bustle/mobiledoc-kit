import TextFormatCommand from './text-format';
import { inherit } from 'content-kit-utils';
import Markup from '../models/markup';
import {
  any
} from '../utils/array-utils';

function BoldCommand(editor) {
  TextFormatCommand.call(this, {
    name: 'bold',
    tag: 'strong',
    mappedTags: ['b'],
    button: '<i class="ck-icon-bold"></i>'
  });
  this.editor = editor;
}
inherit(BoldCommand, TextFormatCommand);

BoldCommand.prototype.exec = function() {
  const markup = Markup.ofType('b');
  this.editor.applyMarkupToSelection(markup);
};

BoldCommand.prototype.isActive = function() {
  let val = any(this.editor.activeMarkers, m => {
    return any(this.mappedTags, tag => m.hasMarkup(tag));
  });
  return val;
};

BoldCommand.prototype.unexec = function() {
  const markup = Markup.ofType('b');
  this.editor.removeMarkupFromSelection(markup);
};

export default BoldCommand;
