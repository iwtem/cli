const chalk = require('chalk');
const inquirer = require('inquirer');
const wrapLoading = require('./utils/wrap-loading');
const resolveApp = require('./utils/resolve-app');
const { getRepos, getRepoTags, downloadRepo } = require('./http');

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
  }

  async getRepo() {
    // 1. 从远程拉取模板数据
    const { data: repoList } = await wrapLoading(getRepos, 'waiting fetch template');

    if (!repoList) {
      return;
    }

    const templates = repoList.map((repo) => repo.name);

    // 2. 用户选择自己新下载的模板名称
    const { template } = await inquirer.prompt({
      name: 'template',
      type: 'list',
      choices: templates,
      message: 'Please choose a template to create project',
    });

    // 3. 返回用户选择的模版
    return template;
  }

  async getTag(repo) {
    // 1. 拉取远程仓库对应的 tag 列表
    const { data } = await wrapLoading(getRepoTags, 'waiting fetch tag', repo);

    if (!data) {
      return;
    }

    const tagList = data.map((tag) => tag.name);

    // 2. 选择 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagList,
      message: 'Place choose a tag to create project',
    });

    return tag;
  }

  async download(repo, tag) {
    const path = resolveApp(this.targetDir);

    await wrapLoading(
      downloadRepo, // 远程下载方法
      'waiting download template', // 加载提示信息
      repo,
      tag,
      path,
    );
  }

  async create() {
    // 1. 获取模板名称
    const repo = await this.getRepo();

    // 2. 获取 repo 的 tag
    const tag = await this.getTag(repo);

    // 2. 下载模版
    await this.download(repo, tag);

    // 3. 模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`);
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`);
    console.log('  npm run dev\r\n');
  }
}

module.exports = Generator;
