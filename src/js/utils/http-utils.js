var HTTP = (function() {

  var head = document.head;
  var uuid = 0;

  return {
    get: function(url, callback) {
      var request = new XMLHttpRequest();
      request.onload = function() {
        callback(this.responseText);
      };
      request.onerror = function(error) {
        callback(null, error);
      };
      request.open('GET', url);
      request.send();
    },

    jsonp: function(url, callback) {
      var script = document.createElement('script');
      var name = '_jsonp_' + uuid++;
      url += ( url.match(/\?/) ? '&' : '?' ) + 'callback=' + name;
      script.src = url;
      exports[name] = function(response) {
        callback(JSON.parse(response));
        head.removeChild(script);
        delete exports[name];
      };
      head.appendChild(script);
    }
  };

}());
