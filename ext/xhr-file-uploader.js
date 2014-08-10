/**
 * A simple ajax file uploader for the browser
 */

(function(exports) {

  function XHRFileUploader(options) {
    options = options || {};
    var url = options.url;
    var maxFileSize = options.maxFileSize;
    if (url) {
      this.url = url;
    } else {
      throw new Error('XHRFileUploader: setting the `url` to an upload service is required'); 
    }
    if (maxFileSize) {
      this.maxFileSize = maxFileSize;
    }
  }

  exports.XHRFileUploader = XHRFileUploader;

  XHRFileUploader.prototype.upload = function(options) {
    if (!options) { return; }

    var fileInput = options.fileInput;
    var file = options.file || (fileInput && fileInput.files && fileInput.files[0]);
    var callback = options.complete;
    var maxFileSize = this.maxFileSize;
    if (!file || !(file instanceof exports.File)) { return; }

    if (maxFileSize && file.size > maxFileSize) {
      if (callback) { callback.call(this, null, { message: 'maximum file size is ' + maxFileSize + ' bytes' }); }
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

  function xhrPost(options) {
    var request = new XMLHttpRequest(); 
    request.open('POST', options.url, true);
    
    request.onload = function () {
      var response = request.responseText;
      if (request.status === 200) {
        return options.success.call(this, response);
      }
      options.error.call(this, response);
    };
    request.onerror = function (error) {
      options.error.call(this, error);
    };

    var formData = new FormData();
    formData.append('file', options.data);
    request.send(formData);
  }

  function responseJSON(jsonString) {
    if (!jsonString) { return null; }
    try {
      return JSON.parse(jsonString);
    } catch(e) {
      return jsonString;
    }
  }

}(this));