var express = require('express');
var UploadService = require('./services/upload');
var EmbedService = require('./services/embed');

// Express app
var app = express();
app.use('/dist', express.static('dist'));

// Enable cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', function(req, res) {
  res.sendFile('/');
});

app.post('/upload', UploadService);
app.get('/embed', EmbedService);

app.listen(process.env.PORT || 5000, function() {
  console.log('content-kit-server: listening on port %d', this.address().port);
});

module.exports = app;
