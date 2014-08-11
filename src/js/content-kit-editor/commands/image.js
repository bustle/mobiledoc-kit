import Command from './base';
import Message from '../views/message';
import ImageModel from '../../content-kit-compiler/models/image';
import { inherit } from '../../content-kit-utils/object-utils';

function ImageCommand(options) {
  Command.call(this, {
    name: 'image',
    button: '<i class="ck-icon-image"></i>'
  });
  if (window.XHRFileUploader) {
    this.uploader = new window.XHRFileUploader({ url: '/upload', maxFileSize: 5000000 });
  }
}
inherit(ImageCommand, Command);

ImageCommand.prototype = {
  exec: function() {
    ImageCommand._super.prototype.exec.call(this);
    var clickEvent = new MouseEvent('click', { bubbles: false });
    if (!this.fileInput) {
      var command = this;
      var fileInput = this.fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'ck-file-input';
      fileInput.addEventListener('change', function(e) {
        command.handleFile(e);
      });
      document.body.appendChild(fileInput);
    }
    this.fileInput.dispatchEvent(clickEvent);
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
