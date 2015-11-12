/* global $, CodeMirror */
let getCode = ({code}) => {
  return code || 'let x = 3;';
};

export default {
  name: 'codemirror-card',
  display: {
    setup(element, options, env, payload) {
      $(element).empty();
      let code = getCode(payload);
      let button = $('<button>Edit</button>');

      if (env.edit) {
        button.on('click', env.edit);
        $(element).append(button);
      }

      let ta = $(`<textarea>${code}</textarea>`);
      $(element).append(ta);
      CodeMirror.fromTextArea(ta[0], {
        mode: 'javascript',
        readOnly: 'nocursor'
      });
    }
  },
  edit: {
    setup(element, options, env, payload) {
      $(element).empty();

      let code = getCode(payload);
      let ta = $(`<textarea>${code}</textarea>`);

      let button = $('<button>Save</button>');
      $(element).append(button);

      $(element).append(ta);
      let cm = CodeMirror.fromTextArea(ta[0], {
        mode: 'javascript'
      });
      button.on('click', () => {
        let code = cm.getValue();
        env.save({code});
      });
    }
  }
};
