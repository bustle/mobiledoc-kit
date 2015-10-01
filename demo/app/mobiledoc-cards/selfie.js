import Ember from 'ember';

let { $ } = Ember;

export let selfieCard = {
  name: 'selfie-card',
  display: {
    setup(element, options, env, payload) {
      $(element).empty();

      if (payload.src) {
        element.appendChild(
          $('' +
              '<div>' +
                '<img src="' + payload.src + '"><br>' +
                '<div>You look nice today.</div>' +
                (env.edit ? "<div><button id='go-edit'>Take a better picture</button></div>" : "") +
              '</div>' +
            '')[0]
        );
      } else {
        element.appendChild($('' +
          '<div>' +
            'Hello there!' +
            (env.edit ? "<button id='go-edit'>Click here to take a picture</button>" : "") +
          '</div>')[0]
        );
      }

      $('#go-edit').click(function() {
        env.edit();
      });
    }
  },
  edit: {
    setup(element, options, env) {
      $(element).empty();

      var vid = $('' +
        '<div>' +
          '<video id="video" width="160" height="120" autoplay></video>' +
          '<button id="snap">Snap Photo</button>' +
          '<canvas id="canvas" width="160" height="120"></canvas>' +
        '</div>' +
      '');
      element.appendChild(vid[0]);

      var canvas = document.getElementById("canvas"),
          context = canvas.getContext("2d"),

          video = document.getElementById("video"),
          videoObj = { "video": true },
          errBack = function() {
            alert('error getting video feed');
          };

      navigator.getMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

      navigator.getMedia(videoObj, function(stream) {
        var vendorURL;
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
          video.play();
        }

        $('#snap').click(function() {
          context.drawImage(video, 0, 0, 160, 120);
          var src = canvas.toDataURL('image/png');
          env.save({src: src});
        });
      }, errBack);
    }
  }
};
