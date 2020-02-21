/* eslint-env node */
module.exports = {
  "framework": "qunit",
  "parallel": 5,
  "disable_watching": true,
  "timeout": 600,
  "browser_start_timeout": 90,
  "test_page": "tests/index.html?hidepassed",
  "on_start": "./sauce_labs/saucie-connect.js",
  "on_exit": "./sauce_labs/saucie-disconnect.js",
  "port": 8080,
  "launchers": {
    "SL_Chrome_Current": {
      "exe": "saucie",
      "args": ["-b", "chrome", "-p", "Windows 10", "-v", "latest", "--no-connect", "-u"],
      "protocol": "tap"
    },
    "SL_MS_Edge": {
      "exe": "saucie",
      "args": ["-b", "microsoftedge", "-v", "15", "--no-connect", "-u"],
      "protocol": "tap"
    },
    "SL_IE_11": {
      "exe": "saucie",
      "args": ["-b", "internet explorer", "-v", "11", "--no-connect", "-u"],
      "protocol": "tap"
    },
    "SL_Safari_Current": {
      "exe": "saucie",
      "args": ["-b", "safari", "-v", "9", "--no-connect", "-u"],
      "protocol": "tap"
    }
  },
  "launch_in_ci": [
    "Chrome",
    "Firefox",
    "SL_Safari_Current",
    "SL_MS_Edge",
    "SL_IE_11"
  ],
  "browser_args": {
    "Chrome": [
      "--no-sandbox", // Fixes issue starting ChromeHeadless, see https://github.com/travis-ci/travis-ci/issues/9024
      "--disable-gpu",
      "--headless",
      "--remote-debugging-port=9222",
      "--window-size=1440,900"
    ]
  }
};
