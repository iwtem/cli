'use strict';

const resolveApp = require('./utils/resove-app');

module.exports = {
  appPath: resolveApp('.'),
  appPackageJson: resolveApp('package.json'),
  templatePath: resolveApp('templates'),
};
