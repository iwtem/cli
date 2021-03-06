const fs = require('fs-extra');
const inquirer = require('inquirer');
const resolveApp = require('../utils/resolve-app');
const Generator = require('../Generator');

async function askNeedOverwrite() {
  return await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'Target directory already exists Pick an action:',
      choices: [
        {
          name: 'Overwrite',
          value: 'overwrite',
        },
        {
          name: 'Cancel',
          value: false,
        },
      ],
    },
  ]);
}

async function create(name, options) {
  const targetDir = resolveApp(name);

  // 判断目标文件夹是否存在
  if (fs.pathExistsSync(targetDir)) {
    const { force } = options;
    // 指定了 force，直接执行覆盖
    if (force) {
      await fs.removeSync(targetDir);
    } else {
      const { action } = await askNeedOverwrite();
      // 询问客户需要执行的操作，确定需要覆盖
      if (action) {
        console.log(`\r\nRemoving...`);
        await fs.removeSync(targetDir);
      }
    }
  }

  // 创建项目
  const generator = new Generator(name, targetDir);

  // 开始创建项目
  await generator.create();
}

module.exports = create;
