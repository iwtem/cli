'use strict';

module.exports = function () {
  const chalk = require('chalk');
  const figlet = require('figlet');

  // drawing the logo
  console.log(
    '\r\n' +
      figlet.textSync('iwtem', {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true,
      }),
  );

  // add explanatory information
  console.log(`\r\nRun ${chalk.cyan(`roc <command> --help`)} show details\r\n`);
};
