'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function (relativePath) {
  const appDirectory = fs.realpathSync(process.cwd());

  return path.resolve(appDirectory, relativePath);
};
