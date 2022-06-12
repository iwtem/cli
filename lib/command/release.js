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
 * 获取 changelog.md 文件
 * @returns {string}
 */
function changelogMD() {
  // TODO 后续增加 CHANGELOG 是否更新的校验提示
  return path.join(rootDir, 'CHANGELOG.md');
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
 * 生成下一个版本号
 * @param currentVersion 当前版本号
 * @param givenVersion 指定的版本号 or prerelease
 * @param prereleaseId 比如 alpha、beta、rc 等
 * @returns {string|null}
 */
function getNextVersion(currentVersion, givenVersion, prereleaseId) {
  invariant(givenVersion != null, `Missing next version. Usage: node version.js [nextVersion]`);

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
 * @returns {Promise<number>}
 */
async function run(givenVersion, prereleaseId) {
  try {
    // 0. Make sure the working directory is clean
    console.log(`  Current working directory is ${chalk.blue(rootDir)}\n`);
    ensureCleanWorkingDirectory();

    // 1. 如果 givenVersion 为空，那么指定用户输入获取
    const currentVersion = await getPackageVersion();

    if (!givenVersion) {
      const { gVersion } = await inquirer.prompt([
        {
          name: 'gVersion',
          message: `Please enter the version number to be released, and must be greater than ${currentVersion} or equal to prerelease:`,
          validate(input) {
            if (/^pre/.test(input)) {
              return true;
            }

            if (!semver.valid(input)) {
              return 'Please enter the correct version number!';
            }

            if (semver.lte(input, currentVersion)) {
              return `Must be greater than ${currentVersion}`;
            }

            return true;
          },
        },
      ]);

      givenVersion = gVersion;

      if (/^pre/.test(gVersion)) {
        const { pid } = await inquirer.prompt([
          {
            name: 'pid',
            type: 'list',
            choices: ['alpha', 'beta', 'rc'],
            default: 'beta',
            message: `Please select a prerelease id`,
          },
        ]);

        prereleaseId = pid;
      }
    }

    // 2. Get the next version number
    let version = semver.valid(givenVersion);
    if (version == null) {
      version = getNextVersion(currentVersion, givenVersion, prereleaseId);
    }

    // 3. Confirm the next version number
    const { answer } = await inquirer.prompt([
      {
        name: 'answer',
        type: 'confirm',
        message: `Are you sure you want to bump version ${currentVersion} to ${version}? [Yn] `,
      },
    ]);
    if (answer === false) return 0;

    // 4. Update version
    await updatePackageConfig((config) => {
      config.version = version;
    });
    console.log(chalk.green(`  Updated to version ${version}`));

    // 5. Commit
    execSync(`git commit --all --message="chore: update version ${currentVersion} -> ${version}"`);
    console.log(chalk.green(`  Committed version ${version}`));

    // 6. Tag
    execSync(`git tag -a v${version} -m "Version ${version}"`);
    console.log(chalk.green(`  Tagged version ${version}`));

    // 7. Push
    const { push } = await inquirer.prompt([
      {
        name: 'push',
        type: 'confirm',
        message: `Are you sure you want to bump version ${currentVersion} to ${version}? [Yn] `,
      },
    ]);

    if (push === false) return 0;

    execSync(`git push --progress --porcelain --tags`);
    console.log(chalk.green(`  Pushed version ${version} and tag ${version}`));
  } catch (error) {
    console.log();
    console.error(chalk.red(`  ${error.message}`));
    console.log();
    return 1;
  }

  return 0;
}

module.exports = run;
