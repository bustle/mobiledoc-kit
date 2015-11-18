/* global $, CodeMirror */
const defaultCode = 'let x = 3;';

function codeMirror(element, code, readOnly=true, callback=()=>{}) {
  setTimeout(() => {
    let ta = $(`<textarea>${code}</textarea>`).appendTo(element);
    let options = {
      mode: 'javascript'
    };
    if (readOnly) {
      options.readOnly = 'nocursor';
    }
    let cm = CodeMirror.fromTextArea(ta[0], options);
    callback(cm);
  });
}

export default {
  name: 'codemirror-card',
  type: 'dom',

  render({env, options, payload}) {
    let element = $('<div></div>')[0];
    let code = payload.code || defaultCode;

    if (env.isInEditor) {
      $('<button>Edit</button>').appendTo(element).on('click', env.edit);
    }

    let readOnly = true;
    codeMirror(element, code, readOnly);

    return element;
  },

  edit({env, options, payload}) {
    let element = $('<div></div>')[0];
    let code = payload.code || defaultCode;

    let saveButton = $('<button>Save</button>').appendTo(element);

    let readOnly = false;
    let callback = (cm) => {
      saveButton.on('click', () => env.save({code: cm.getValue()}));
    };
    codeMirror(element, code, readOnly, callback);

    return element;
  }
};
