var express = require('express');
var UploadService = require('./services/upload');
var EmbedService = require('./services/embed');

// Express app
var app = express();
app.use(express.static('demo'));
app.use('/dist', express.static('dist'));
app.get('/', function(req, res) {
  res.sendFile('/');
});

app.post('/upload', UploadService);
app.get('/embed', EmbedService);

app.listen(process.env.PORT || 5000, function() {
  console.log('content-kit-server: listening on port %d', this.address().port);
});

module.exports = app;
