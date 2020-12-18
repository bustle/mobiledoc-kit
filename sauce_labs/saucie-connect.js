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
  connectVersion: '4.6.2'
};

if (process.env.GITHUB_RUN_ID) {
  opts.tunnelIdentifier = process.env.GITHUB_RUN_ID;
}

saucie.connect(opts).then(function () {
  process.exit();
});
