/* global $ */
const defaultSrc = 'http://placekitten.com/200/75';

function displayImage(element, src=defaultSrc) {
  let img = $(`<img src="${src}">`);
  $(element).append(img);
}

export default {
  name: 'image-card',
  display: {
    setup(element, options, env, payload) {
      displayImage(element, payload.src);
      if (env.edit) {
        $('<button>Change</button>').appendTo(element)
          .on('click', env.edit);
      }
      return element;
    },
    teardown(element) {
      $(element).empty();
    }
  },
  edit: {
    setup(element, options, env, payload) {
      function importImage(event) {
        let reader = new FileReader();
        let file = event.target.files[0];
        reader.onloadend = () => {
          env.save({src: reader.result});
        };
        reader.readAsDataURL(file);
      }

      $('<input type="file">').appendTo(element)
        .on('change', importImage);

      $('<button>Save</button>').appendTo(element)
        .on('click', () => { env.save(payload); });

      return element;
    },
    teardown(element) {
      $(element).empty();
    }
  },
  html: {
    setup(buffer, options, env, payload) {
      let src = payload.src || defaultSrc;
      let html = `<img src="${src}">`;
      buffer.push(html);
    }
  },
  text: {
    setup(/*str, options, env, payload*/) {
      return "[image]";
    }
  }
};
