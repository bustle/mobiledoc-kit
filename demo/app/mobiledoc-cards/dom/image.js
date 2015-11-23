/* global $ */
const defaultSrc = 'http://placekitten.com/200/75';

function makeImageInWrapper(src=defaultSrc) {
  return $('<div></div>').append(`<img src="${src}">`)[0];
}

export default {
  name: 'image-card',
  type: 'dom',
  render({env, payload}) {
    let element = makeImageInWrapper(payload.src);
    let { isInEditor } = env;

    if (isInEditor) {
      $('<button>Change</button>').appendTo(element)
        .on('click', env.edit);
    }

    return element;
  },
  edit({env, payload}) {
    let element = makeImageInWrapper(payload.src);

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
  }
  /* FIXME: html and text
  html: {
    setup(buffer, options, env, payload) {
      let src = payload.src || defaultSrc;
      let html = `<img src="${src}">`;
      buffer.push(html);
    }
  },
  text: {
    setup(str, options, env, payload) {
      return "[image]";
    }
  }
  */
};
