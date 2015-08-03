import Command from './base';
import Message from '../views/message';
import { FileUploader } from '../utils/http-utils';
import { generateBuilder } from '../utils/post-builder';

function readFromFile(file, callback) {
  var reader = new FileReader();
  reader.onload = ({target}) => callback(target.result);
  reader.readAsDataURL(file);
}

export default class ImageCommand extends Command {
  constructor(options={}) {
    super({
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
    this.uploader = new FileUploader({
      url: options.serviceUrl,
      maxFileSize: 5000000
    });
  }

  exec() {
    super.exec();
    var fileInput = this.getFileInput();
    fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
  }

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
  }

  handleFile({target: fileInput}) {
    let imageSection;

    let file = fileInput.files[0];
    readFromFile(file, (base64Image) => {
      imageSection = generateBuilder().generateImageSection(base64Image);
      this.editor.insertSectionAtCursor(imageSection);
      this.editor.rerender();
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
          this.editor.rerender();
          this.editor.trigger('update');
        } else {
          this.editor.removeSection(imageSection);
          new Message().showError(error.message || 'Error uploading image');
        }
        this.editor.rerender();
      }
    });
  }
}
