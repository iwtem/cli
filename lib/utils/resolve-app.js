'use strict';

module.exports = function (relativePath) {
  const path = require('path');
  const fs = require('fs');
  const appDirectory = fs.realpathSync(process.cwd());

  return path.resolve(appDirectory, relativePath);
};
