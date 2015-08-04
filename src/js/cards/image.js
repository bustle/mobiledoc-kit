import placeholderImage from './placeholder-image';
import { FileUploader } from '../utils/http-utils';

function buildFileInput() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.classList.add('ck-file-input');
  document.body.appendChild(input);
  return input;
}

function buildButton(text) {
  let button = document.createElement('button');
  button.innerHTML = text;
  return button;
}

function upload(imageOptions, fileInput, success, failure) {
  let uploader = new FileUploader({
    url: imageOptions.uploadUrl,
    maxFileSize: 5000000
  });
  uploader.upload({
    fileInput,
    complete: (response, error) => {
      if (!error && response && response.url) {
        success({
          src: response.url
        });
      } else {
        window.alert('There was a problem uploading the image: '+error);
        failure();
      }
    }
  });
}

export default {
  name: 'image',

  display: {
    setup(element, options, {edit}, payload) {
      var img = document.createElement('img');
      img.src = payload.src || placeholderImage;
      if (edit) {
        img.onclick = edit;
      }
      element.appendChild(img);
      return img;
    },
    teardown(element) {
      element.parentNode.removeChild(element);
    }
  },

  edit: {
    setup(element, options, {save, cancel}) {
      let uploadButton = buildButton('Upload');
      let cancelButton = buildButton('Cancel');
      cancelButton.onclick = cancel;

      let {image: imageOptions} = options;
      if (!imageOptions || (imageOptions && !imageOptions.uploadUrl)) {
        window.alert('Image card must have `image.uploadUrl` included in cardOptions');
        cancel();
        return;
      }


      let fileInput = buildFileInput();
      uploadButton.onclick = () => {
        fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
      };
      element.appendChild(uploadButton);
      element.appendChild(cancelButton);

      fileInput.onchange = () => {
        try {
          if (fileInput.files.length === 0) {
            cancel();
          }
          upload(imageOptions, fileInput, save, cancel);
        } catch(error) {
          window.alert('There was a starting the upload: '+error);
          cancel();
        }
      };
      return [uploadButton, cancelButton, fileInput];
    },
    teardown(elements) {
      elements.forEach(element => element.parentNode.removeChild(element));
    }
  }

};
