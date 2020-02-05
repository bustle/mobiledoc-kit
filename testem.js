/* eslint-env node */
module.exports = {
  "framework": "qunit",
  "browser_start_timeout": 120,
  "test_page": "tests/index.rollup.html?hidepassed",
  "src_files": [
    "tests/**/*.js",
    "src/**/*.js"
  ],
  "launch_in_dev": [
    "Chrome"
  ],
  "launch_in_ci": [
    // "Safari",
    "Chrome",
    "Firefox"
  ],
  "browser_args": {
    "Chrome": [
      "--disable-gpu",
      "--headless",
      "--remote-debugging-port=9222",
      "--window-size=1440,900"
    ]
  }
};
