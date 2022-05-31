'use strict';

const resolveApp = require('./utils/resolve-app');

module.exports = {
  appPath: resolveApp('.'),
  appPackageJson: resolveApp('package.json'),
  templatePath: resolveApp('templates'),
};
