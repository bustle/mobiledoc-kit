import Command from './base';
import Message from '../views/message';
import { inherit } from 'content-kit-utils';
import { FileUploader } from '../utils/http-utils';
import { generateBuilder } from '../utils/post-builder';

function readFromFile(file, callback) {
  var reader = new FileReader();
  reader.onload = ({target}) => callback(target.result);
  reader.readAsDataURL(file);
}

function ImageCommand(options) {
  Command.call(this, {
    name: 'image',
    button: '<i class="ck-icon-image"></i>'
  });
  this.uploader = new FileUploader({
    url: options.serviceUrl,
    maxFileSize: 5000000
  });
}
inherit(ImageCommand, Command);

ImageCommand.prototype = {
  exec() {
    ImageCommand._super.prototype.exec.call(this);
    var fileInput = this.getFileInput();
    fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
  },
  getFileInput() {
    if (this._fileInput) {
      return this._fileInput;
    }

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'ck-file-input';
    fileInput.addEventListener('change', e => this.handleFile(e));
    document.body.appendChild(fileInput);

    return fileInput;
  },
  handleFile({target: fileInput}) {
    let imageSection;

    let file = fileInput.files[0];
    readFromFile(file, (base64Image) => {
      imageSection = generateBuilder().generateImageSection(base64Image);
      this.editorContext.insertSectionAtCursor(imageSection);
      this.editorContext.rerender();
    });

    this.uploader.upload({
      fileInput,
      complete: (response, error) => {
        if (!imageSection) {
          throw new Error('Upload completed before the image was read into memory');
        }
        if (!error && response && response.url) {
          imageSection.src = response.url;
          imageSection.renderNode.markDirty();
          this.editorContext.rerender();
          this.editorContext.trigger('update');
        } else {
          this.editorContext.removeSection(imageSection);
          new Message().showError(error.message || 'Error uploading image');
        }
        this.editorContext.rerender();
      }
    });
  }
};

export default ImageCommand;
