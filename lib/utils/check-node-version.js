'use strict';

const semver = require('semver');
const pkg = require('../../package.json');

module.exports = function checkNodeVersion() {
  const nodeVersion = process.version.replace(/-.*$/, '');

  if (!semver.satisfies(nodeVersion, pkg.engines.node)) {
    console.error(`当前 npm 版本不支持 Node.js ${process.version}`);
    process.exit(1);
  }
};
