'use strict';

const util = require('util');
const { Octokit } = require('@octokit/rest');
const downloadGitRepo = require('download-git-repo');

const IOctokit = Octokit.defaults({
  baseUrl: process.env.REPO_ORIGIN,
});

/**
 * 获取远程仓库列表
 * @returns {Promise<any>}
 */
function getRepos() {
  const octokit = new IOctokit();

  return octokit.request('GET /orgs/{org}/repos', {
    org: process.env.ORG,
  });
}

/**
 * 获取仓库的版本信息
 * @param repo {string} 仓库名称
 * @returns {Promise<any>}
 */
function getRepoTags(repo) {
  const octokit = new IOctokit();

  return octokit.request('GET /repos/{owner}/{repo}/tags', {
    owner: process.env.ORG,
    repo,
  });
}

/**
 * 下载仓库中的文件
 * @param repo 仓库名称
 * @param tag 版本
 * @param path 文件保存路径
 */
function downloadRepo(repo, tag, path) {
  const downloadGitRepoPromise = util.promisify(downloadGitRepo);
  const downloadUrl = `${process.env.ORG}/${repo}${tag ? '#' + tag : ''}`;

  return downloadGitRepoPromise(downloadUrl, path, {});
}

module.exports = {
  getRepos,
  getRepoTags,
  downloadRepo,
};
