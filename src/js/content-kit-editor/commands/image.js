import Command from './base';
import Message from '../views/message';
import ImageModel from '../../content-kit-compiler/models/image';
import { inherit } from '../../content-kit-utils/object-utils';
import { FileUploader } from '../../ext/content-kit-services';

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

function insertImageWithSrc(src, editor) {
  var imageModel = new ImageModel({ src: src });
  var index = editor.getCurrentBlockIndex();
  editor.replaceBlockAt(imageModel, index);
  editor.syncVisualAt(index);
}

function renderFromFile(file, editor) {
  if (file && window.FileReader) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var base64Src = e.target.result;
      insertImageWithSrc(base64Src, editor);
    };
    reader.readAsDataURL(file);
  }
}

function ImageCommand() {
  Command.call(this, {
    name: 'image',
    button: '<i class="ck-icon-image"></i>'
  });
  this.uploader = new FileUploader({ url: '/upload', maxFileSize: 5000000 });
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
    var editor = this.editorContext;
    var embedIntent = this.embedIntent;

    embedIntent.showLoading();
    this.uploader.upload({
      fileInput: fileInput,
      complete: function(response, error) {
        embedIntent.hideLoading();
        if (error || !response || !response.url) {
          return new Message().show(error.message || 'Error uploading image');
        }
        insertImageWithSrc(response.url, editor);
      }
    });
    renderFromFile(fileInput.files && fileInput.files[0], editor); // render image immediately client-side
    fileInput.value = null; // reset file input
  }
};

export default ImageCommand;
