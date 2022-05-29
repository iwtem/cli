#! /usr/bin/env node

'use strict';

// 1. 处理抛出的异常，而非忽略
process.on('unhandledRejection', (err) => {
  throw err;
});

// 2. 检查 NodeJS 版本
require('../lib/utils/check-node-version')();

const { program } = require('commander');

const paths = require('../lib/paths');
const pkg = require(paths.appPackageJson);

program
  .command('init')
  .description('initialise a project with a prompt')
  .option('-y, --yes', 'use default values')
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    require('../lib/init')(name, options);
  });

program
  .command('create <app-name>')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    require('../lib/create')(name, options);
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
  require('../lib/help')();
});

program.version(`v${pkg.version}`).usage('<command> [option]');

program.parse(process.argv);
