var embedly = require('embedly');
var util = require('util');

var EMBEDLY_KEY = 'XXXXXX';

module.exports = function(req, res) {

  new embedly({key: EMBEDLY_KEY}, function(err, api) {
    if (!!err) {
      console.error('Error creating Embedly api');
      console.error(err.stack, api);
      return res.status(500).json(err);
    }

    var url = req.query.url;
    if (!(/^https?:\/\//i).test(url)) {
      url = 'http://' + url;
    }

    api.oembed({url: url}, function(err, objs) {
      if (!!err) {
        console.error(err.stack, objs);
        return res.status(500).json(err);
      }

      if (objs[0].error_message) {
        return res.status(500).json(objs[0].error_message);
      }
      console.log(util.inspect(objs[0]));
      res.json(objs[0]);
    });

  });

};
