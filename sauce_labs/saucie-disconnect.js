#!/usr/bin/env node

// From https://github.com/testem/testem/blob/master/examples/saucelabs/saucie-disconnect.js

var saucie = require('saucie');
var pidFile = 'sc_client.pid';

saucie.disconnect(pidFile);
