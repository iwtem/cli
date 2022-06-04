const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');
const jsonfile = require('jsonfile');
const semver = require('semver');

const rootDir = process.cwd();

/**
 * 获取 package.json 文件路径
 * @returns {string}
 */
function packageJson() {
  return path.join(rootDir, 'package.json');
}

/**
 * 断言失败并抛出错误信息
 * @param {*} cond
 * @param {string} message
 * @returns {asserts cond}
 */
function invariant(cond, message) {
  if (!cond) throw new Error(message);
}

/**
 * 确保当前的工作目录是干净的（所有文件都已被 commit or stash）
 */
function ensureCleanWorkingDirectory() {
  const status = execSync(`git status --porcelain`).toString().trim();
  const lines = status.split('\n');
  invariant(
    lines.every((line) => line === '' || line.startsWith('?')),
    'Working directory is not clean. Please commit or stash your changes.',
  );
}

/**
 * 根据指定的参数，生成下一个版本号
 * @param {string} currentVersion
 * @param {string} givenVersion
 * @param {string} [prereleaseId]
 * @returns {string}
 */
function getSpecifiedVersion(currentVersion, givenVersion, prereleaseId) {
  invariant(givenVersion != null, `Missing next version.`);

  if (/^pre/.test(givenVersion)) {
    invariant(
      prereleaseId != null,
      `Missing prerelease id. Usage: node version.js ${givenVersion} [prereleaseId]`,
    );
  }

  const nextVersion = semver.inc(currentVersion, givenVersion, prereleaseId);

  invariant(nextVersion != null, `Invalid version specifier: ${givenVersion}`);

  return nextVersion;
}

/**
 * 根据 release 类型，生成下一个版本号(major, premajor, minor, preminor, patch, prepatch, or prerelease)
 * @param currentVersion
 * @param options
 * @returns {string|null}
 */
function getNextVersion(currentVersion, options) {
  const types = Object.keys(options);
  const lastType = types[types.length - 1];
  // If more than one type is specified, use the last one.
  if (options[lastType]) {
    return semver.inc(currentVersion, lastType);
  }

  return null;
}

/**
 * 获取项目的当前版本
 */
async function getPackageVersion() {
  const file = packageJson();
  const json = await jsonfile.readFile(file);
  return json.version;
}

/**
 * 更新 package.json 中的配置信息
 * @param {(json: string) => any} transform
 */
async function updatePackageConfig(transform) {
  const file = packageJson();
  const json = await jsonfile.readFile(file);
  transform(json);
  await jsonfile.writeFile(file, json, { spaces: 2 });
}

/**
 * 升级当前项目到新版本
 * @param givenVersion
 * @param prereleaseId
 * @param options
 * @returns {Promise<number>}
 */
async function run(givenVersion, prereleaseId, options) {
  try {
    // 0. Make sure the working directory is clean
    ensureCleanWorkingDirectory();

    const currentVersion = await getPackageVersion();
    // 1. Get the next version number
    let version = getNextVersion(currentVersion, options) || semver.valid(givenVersion);
    if (version == null) {
      version = getSpecifiedVersion(currentVersion, givenVersion, prereleaseId);
    }

    // 2. Confirm the next version number
    const { answer } = await inquirer.prompt([
      {
        name: 'answer',
        type: 'confirm',
        message: `Are you sure you want to bump version ${currentVersion} to ${version}? [Yn] `,
      },
    ]);
    if (answer === false) return 0;

    // 3. Update version
    await updatePackageConfig((config) => {
      config.version = version;
    });
    console.log(chalk.green(`  Updated to version ${version}`));

    // 7. Commit and tag
    execSync(`git commit --all --message="chore: update version ${currentVersion} -> ${version}"`);
    execSync(`git tag -a -m "Version ${version}" v${version}`);
    console.log(chalk.green(`  Committed and tagged version ${version}`));
  } catch (error) {
    console.log();
    console.error(chalk.red(`  ${error.message}`));
    console.log();
    return 1;
  }

  return 0;
}

module.exports = run;
