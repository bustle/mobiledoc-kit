function xhrGet(url, callback) {
  var request = new XMLHttpRequest();
  request.onload = function() {
    callback(this.responseText);
  };
  request.onerror = function(error) {
    callback(null, error);
  };
  request.open('GET', url, true);
  request.send();
}

export { xhrGet };
