#! /usr/bin/env node

'use strict';

// 1. 处理抛出的异常，而非忽略
process.on('unhandledRejection', (err) => {
  throw err;
});

// 2. 检查 NodeJS 版本
require('../lib/utils/check-node-version')();

// 3. 加载 .env 文件
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../', '.env') });

const { program } = require('commander');
const pkg = require('../package.json');

program
  .command('create')
  .argument('<app-name>', 'application name')
  .description('create a new project')
  .option('--template', 'specify a template')
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    require('../lib/command/create')(name, options);
  });

program
  .command('release')
  .description('publish a release version for the current project')
  .argument('[givenVersion]', 'specify the upgraded version number')
  .argument('[prereleaseId]', 'specify the prerelease id, such as beta, alpha, rc, etc.')
  .action((givenVersion, prereleaseId) => {
    require('../lib/command/release')(givenVersion, prereleaseId).then((code) => {
      process.exit(code);
    });
  });

program.on('--help', () => {
  require('../lib/command/help')();
});

program.version(`v${pkg.version}`).usage('<command> [option]');

program.parse(process.argv);
