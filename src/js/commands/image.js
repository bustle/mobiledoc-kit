import Command from './base';
import Message from '../views/message';
import Type from 'node_modules/content-kit-compiler/src/types/type';
import BlockModel from 'node_modules/content-kit-compiler/src/models/block';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import { FileUploader } from '../utils/http-utils';

function createFileInput(command) {
  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.className = 'ck-file-input';
  fileInput.addEventListener('change', function(e) {
    command.handleFile(e);
  });
  return fileInput;
}

function injectImageBlock(src, editor, index) {
  var imageModel = BlockModel.createWithType(Type.IMAGE, { attributes: { src: src } });
  editor.replaceBlock(imageModel, index);
}

function renderFromFile(file, editor, index) {
  if (file && window.FileReader) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var base64Src = e.target.result;
      injectImageBlock(base64Src, editor, index);
      editor.renderBlockAt(index, true);
    };
    reader.readAsDataURL(file);
  }
}

function ImageCommand(options) {
  Command.call(this, {
    name: 'image',
    button: '<i class="ck-icon-image"></i>'
  });
  this.uploader = new FileUploader({ url: options.serviceUrl, maxFileSize: 5000000 });
}
inherit(ImageCommand, Command);

ImageCommand.prototype = {
  exec: function() {
    ImageCommand._super.prototype.exec.call(this);
    var fileInput = this.fileInput;
    if (!fileInput) {
      fileInput = this.fileInput = createFileInput(this);
      document.body.appendChild(fileInput);
    }
    fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
  },
  handleFile: function(e) {
    var fileInput = e.target;
    var file = fileInput.files && fileInput.files[0];
    var editor = this.editorContext;
    var embedIntent = this.embedIntent;
    var currentEditingIndex = editor.getCurrentBlockIndex();

    embedIntent.showLoading();
    renderFromFile(file, editor, currentEditingIndex); // render image immediately client-side
    this.uploader.upload({
      fileInput: fileInput,
      complete: function(response, error) {
        embedIntent.hideLoading();
        if (error || !response || !response.url) {
          setTimeout(function() {
            editor.removeBlockAt(currentEditingIndex);
            editor.syncVisual();
          }, 1000);
          return new Message().showError(error.message || 'Error uploading image');
        }
        injectImageBlock(response.url, editor, currentEditingIndex);
      }
    });
    fileInput.value = null; // reset file input
  }
};

export default ImageCommand;
