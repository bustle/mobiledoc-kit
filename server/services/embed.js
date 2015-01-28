var embedly = require('embedly');

module.exports = function(req, res) {

  var url = req.query.url;
  if (!(/^https?:\/\//i).test(url)) {
    url = 'http://' + url;
  }

  new embedly({key: process.env.EMBEDLY_KEY}, function(err, api) {
    if (err) {
      return res.status(500).json(err);
    }

    var url = req.query.url;
    if (!(/^https?:\/\//i).test(url)) {
      url = 'http://' + url;
    }

    api.oembed({url: url}, function(err, objs) {
      if (err) {
        var message = JSON.parse(objs).error_message;
        return res.status(500).json(message);
      }

      res.json(objs[0]);
    });

  });

};
