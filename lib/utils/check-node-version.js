'use strict';

module.exports = function checkNodeVersion() {
  const semver = require('semver');
  const paths = require('../paths');
  const pkg = require(paths.appPackageJson);
  const nodeVersion = process.version.replace(/-.*$/, '');

  if (!semver.satisfies(nodeVersion, pkg.engines.node)) {
    console.error(`当前 npm 版本不支持 Node.js ${process.version}`);
    process.exit(1);
  }
};
