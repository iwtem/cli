'use strict';

const path = require('path');
const { execSync } = require('child_process');
const jsonfile = require('jsonfile');
const semver = require('semver');

const rootDir = process.cwd();

/**
 * 断言并抛出错误信息
 * @param {*} cond
 * @param {string} message
 * @returns {asserts cond}
 */
function invariant(cond, message) {
  if (!cond) throw new Error(message);
}

/**
 * 获取当前 repo 的标签列表
 * @returns {string}
 */
function getTaggedVersion() {
  const output = execSync('git tag --list --points-at HEAD').toString();
  return output.replace(/^v|\n+$/g, '');
}

/**
 * 判断发布的版本
 * @param {string|number} version
 */
async function ensureBuildVersion(version) {
  const file = path.join(rootDir, 'package.json');
  const json = await jsonfile.readFile(file);
  invariant(
    json.version === version,
    `Package ${json.name} is on version ${json.version}, but should be on ${version}`,
  );
}

/**
 * @param {string} tag
 */
function publishBuild(tag) {
  const buildDir = path.join(rootDir);
  console.log();
  console.log(`  npm publish ${buildDir} --tag ${tag}`);
  console.log();
  execSync(`npm publish ${buildDir} --tag ${tag}`, { stdio: 'inherit' });
}

/**
 * @returns {Promise<1 | 0>}
 */
async function run() {
  try {
    // 0. Ensure we are in CI. We don't do this manually
    invariant(process.env.CI, `You should always run the publish script from the CI environment!`);

    // 1. Get the current tag, which has the release version number
    const version = getTaggedVersion();
    invariant(version !== '', 'Missing release version. Run the version script first.');

    // 2. Determine the appropriate npm tag to use
    const tag = semver.prerelease(version) == null ? 'latest' : 'next';

    console.log();
    console.log(`  Publishing version ${version} to npm with tag "${tag}"`);

    // 3. Ensure build versions match the release version
    await ensureBuildVersion(version);

    // 4. Publish to npm
    publishBuild(tag);
  } catch (error) {
    console.log();
    console.error(`  ${error.message}`);
    console.log();
    return 1;
  }

  return 0;
}

module.exports = run;
