var express = require('express');
var config = require('./config');
var S3UploadService = require('./services/s3-uploader');
var EmbedService = require('./services/embed');

// Express app
var app = express();

// Demo setup
app.use(express.static('demo'));
app.use('/dist', express.static('dist'));
app.get('/', function(req, res) {
  res.sendFile('/');
});

// Routes
app.post('/upload', S3UploadService);
app.get('/embed', EmbedService);

app.listen(5000, function() {
  console.log('content-kit-editor server: listening on port %d', this.address().port);
});

module.exports = app;
