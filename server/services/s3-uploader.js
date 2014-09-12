var crypto = require('crypto');
var Busboy = require('busboy');
var AWS = require('aws-sdk');
var config = require('../config');

AWS.config = config.aws;
var maxFileSize = config.s3.maxFileSize || 5000000;
var uploadBucket = config.s3.bucketName;
var s3 = new AWS.S3({ params: { Bucket: uploadBucket } });

function readFileStream(req, res) {
  var busboy = new Busboy({ 
    headers: req.headers,
    limits: { fileSize: maxFileSize }
  });

  busboy.on('file', function(fieldname, stream, filename, encoding, mimeType) {
    if (!filename) {
      stream.resume();
      return res.json(500, { message: 'invalid file', status: 500 });
    }
    req.files = req.files || {};

    stream.chunks = [];
    stream.on('data', function(chunk) {
      this.chunks.push(chunk);
    });

    stream.on('error', function(error) {
      return res.json(500, { message: 'error reading file', status: 500 });
    });

    stream.on('end', function() {
      if (this.truncated) {
        return res.json(500, { message: 'max file size is ' + maxFileSize + ' bytes', status: 500 });
      }
      var finalBuffer = Buffer.concat(this.chunks);
      var file = req.files[fieldname] = {
        buffer   : finalBuffer,
        size     : finalBuffer.length,
        filename : renameFile(filename),
        mimeType : mimeType
      };
      putFileBufferToS3(file, res);
    });
  });

  req.pipe(busboy);
}

function renameFile(filename) {
  var ext = filename.indexOf('.') > 0 ? '.' + filename.split('.').slice(-1)[0] : '';
  var bareFilename = filename.replace(ext, '');
  var randomString = filename + Date.now() + Math.random();
  randomString = crypto.createHash('md5').update(randomString).digest('hex');
  return randomString + ext;
}

function putFileBufferToS3(file, res) {
  var key = file.filename;
  var params = { 
    Key: key,
    Body: file.buffer, 
    ContentType: file.mimeType,
    ContentLength: file.size,
    ACL: 'public-read'
  };

  var request = s3.putObject(params, function(error, data) {
    if (error) {
      return res.json(500, { message: 'error uploading to S3', status: 500 });
    }
    res.json({ url: 'https://s3.amazonaws.com/' + uploadBucket + '/' + key });
  });

  // Can we send this to the client?
  /*
  request.on('httpUploadProgress', function (progress) {
    console.log('Uploaded', progress.loaded, 'of', progress.total, 'bytes');
  });
  */
}

module.exports = readFileStream;
