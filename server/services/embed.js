var embedly = require('embedly');
var util = require('util');
var config = require('../config');

module.exports = function(req, res) {

  new embedly({key: config.embedlyKey}, function(err, api) {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    var url = req.query.url;
    if (!(/^https?:\/\//i).test(url)) {
      url = 'http://' + url;
    }

    api.oembed({url: url}, function(err, objs) {
      if (err) {
        console.log(err, objs);
        var message = JSON.parse(objs).error_message;
        return res.status(500).json(message);
      }

      console.log(util.inspect(objs[0]));
      res.json(objs[0]);
    });

  });

};
