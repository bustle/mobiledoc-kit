function createXHR(options) {
  var xhr = new XMLHttpRequest();
  xhr.open(options.method, options.url);
  xhr.onload = function () {
    var response = xhr.responseText;
    if (xhr.status === 200) {
      return options.success.call(this, response);
    }
    options.error.call(this, response);
  };
  xhr.onerror = function (error) {
    options.error.call(this, error);
  };
  return xhr;
}

function xhrPost(options) {
  options.method = 'POST';
  var xhr = createXHR(options);
  var formData = new FormData();
  formData.append('file', options.data);
  try {
    xhr.send(formData);
  } catch(error) {}
}

function responseJSON(jsonString) {
  if (!jsonString) { return null; }
  try {
    return window.JSON.parse(jsonString);
  } catch(e) {
    return jsonString;
  }
}

// --------------------------------------------

function FileUploader(options) {
  options = options || {};
  var url = options.url;
  var maxFileSize = options.maxFileSize;
  if (url) {
    this.url = url;
  } else {
    throw new Error('FileUploader: setting the `url` to an upload service is required');
  }
  if (maxFileSize) {
    this.maxFileSize = maxFileSize;
  }
}

FileUploader.prototype.upload = function(options) {
  if (!options) { return; }

  var fileInput = options.fileInput;
  var file = options.file || (fileInput && fileInput.files && fileInput.files[0]);
  var callback = options.complete;
  var maxFileSize = this.maxFileSize;
  if (!file || !(file instanceof window.File)) { return; }

  if (maxFileSize && file.size > maxFileSize) {
    if (callback) { callback.call(this, null, { message: 'max file size is ' + maxFileSize + ' bytes' }); }
    return;
  }

  xhrPost({
    url: this.url,
    data: file,
    success: function(response) {
      if (callback) { callback.call(this, responseJSON(response)); }
    },
    error: function(error) {
      if (callback) { callback.call(this, null, responseJSON(error)); }
    }
  });
};

export { FileUploader };
