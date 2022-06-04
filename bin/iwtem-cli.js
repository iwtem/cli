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
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { program } = require('commander');
const pkg = require('../package.json');

program
  .command('init')
  .description('initialise a project with a prompt')
  .option('-y, --yes', 'use default values')
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    require('../lib/command/init')(name, options);
  });

program
  .command('upgrade')
  .description('new version for current projects')
  .argument('[givenVersion]', 'specify the upgraded version number')
  .option('--patch', 'upgrade patch version')
  .option('--prepatch', 'upgrade prepatch version')
  .option('--minor', 'upgrade minor version')
  .option('--premajor', 'upgrade premajor version')
  .option('--major', 'upgrade major version')
  .option('--premajor', 'upgrade premajor version')
  .option('--prerelease', 'upgrade prerelease version')
  .option('--release', 'is it a release version')
  .action((givenVersion, options) => {
    require('../lib/command/upgrade')(givenVersion, options).then((code) => {
      process.exit(code);
    });
  });

program
  .command('create')
  .argument('<app-name>', 'application name')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    require('../lib/command/create')(name, options);
  });

program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <app-path>', 'get value from option')
  .option('-s, --set <app-path> <value>')
  .option('-d, --delete <app-path>', 'delete option from config')
  .action((value, options) => {
    console.log(value, options);
  });

program.on('--help', () => {
  require('../lib/command/help')();
});

program.version(`v${pkg.version}`).usage('<command> [option]');

program.parse(process.argv);
