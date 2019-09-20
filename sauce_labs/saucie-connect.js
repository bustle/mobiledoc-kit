#!/usr/bin/env node

// From https://github.com/testem/testem/blob/master/examples/saucelabs/saucie-connect.js

var saucie = require('saucie');
var pidFile = 'sc_client.pid';

var opts = {
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  verbose: true,
  logger: console.log,
  pidfile: pidFile,
  connectVersion: '4.4.12'
};

if (process.env.TRAVIS_JOB_NUMBER) {
  opts.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
}

saucie.connect(opts).then(function () {
  process.exit();
});
