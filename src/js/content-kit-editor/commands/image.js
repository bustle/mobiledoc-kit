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
        var imageModel = new ImageModel({ src: response.url });
        var index = editor.getCurrentBlockIndex();
        editor.insertBlockAt(imageModel, index);
        editor.syncVisualAt(index);
      }
    });
    fileInput.value = null; // reset file input
    // TODO: client-side render while uploading
  }
};

export default ImageCommand;
