import Ember from 'ember';

let { $ } = Ember;

export default {
  name: 'selfie-card',
  type: 'dom',
  render: ({env, payload}) => {
    let element = $('<div></div>')[0];
    let { isInEditor } = env;
    if (payload.src) {
      $('<div>' +
          '<img src="' + payload.src + '"><br>' +
          '<div>You look nice today.</div>' +
          (isInEditor ? "<div><button id='go-edit'>Take a better picture</button></div>" : "") +
        '</div>').appendTo(element);
    } else {
      $('<div>' +
          'Hello there!' +
          (isInEditor ? "<button id='go-edit'>Click here to take a picture</button>" : "") +
        '</div>').appendTo(element);
    }

    if (isInEditor) {
      setTimeout(() => {
        $('#go-edit').on('click', env.edit);
      });
    }

    return element;
  },

  edit({env}) {
    let element = $('<div></div>')[0];
    $('<div>' +
        '<video id="video" width="400" height="300" autoplay></video>' +
        '<button id="snap">Snap Photo</button>' +
        '<canvas id="canvas" width="400" height="300"></canvas>' +
      '</div>').appendTo(element);

    setTimeout(() => {
      let canvas = document.getElementById("canvas"),
          context = canvas.getContext("2d"),
          video = document.getElementById("video"),
          videoObj = { "video": true },
          errBack = () => alert('error getting video feed');

      navigator.getMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

      navigator.getMedia(videoObj, (stream) => {
        let vendorURL;
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
          video.play();
        }

        $('#snap').click(() => {
          context.drawImage(video, 0, 0, 400, 300);
          let src = canvas.toDataURL('image/png');
          env.save({src});
        });
      }, errBack);
    });

    return element;
  }
  /*
  html: {
    setup(buffer, options, env, payload) {
      buffer.push(`<img src="${payload.src}>"`);
    }
  },
  text: {
    setup() {
      return "[ :-) ]";
    }
  }
 */
};
