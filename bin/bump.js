#!/usr/bin/env node
/* eslint strict:0 */
'use strict';
const spawn = require('child_process').spawnSync;
const semver = require('semver');
const fs = require('fs');

/**
 * Checks whether value is not null.
 * @return {boolean} Value is not null
 */
function isNotNull(value) {
  return value !== null;
}

/**
 * Gets current repository version from git describe.
 * @return {semver} Version
 */
function getGitDescribeVersion() {
  let gitDescribeVersion = null;

  const gitDescribeProc = spawn('git', ['describe', '--abbrev=0']);
  if (gitDescribeProc.status !== 0) {
    console.log('Did not find a version tag in git');
  } else {
    const procStdout = gitDescribeProc.stdout.toString();
    gitDescribeVersion = semver.clean(procStdout);
    console.log(`${gitDescribeVersion} in git describe`);
  }
  return gitDescribeVersion;
}

/**
 * Gets current application version from package.json.
 * Limitation: Only checks package.json in current working directory.
 * @return {semver} Version
 */
function getPackageVersion() {
  let packageVersion = null;
  try {
    packageVersion = JSON.parse(fs.readFileSync('./package.json')).version;
  } catch (ex) {
    /* Do nothing */
  }
  if (packageVersion === undefined) {
    console.log('Did not find a version in package.json');
    packageVersion = null;
  } else {
    console.log(`${packageVersion} in package.json`);
  }
  return packageVersion;
}

/**
 * Compares versions from different sources and returns latest.
 * We are hunting for a new version to release, so we cover following cases:
 * * If version in code is equal to or older than the version already tagged
 *   in the repository, we bump it a patch version for developer convenience.
 * * If version in code is newer, developer bumped it so we choose it.
 * * If we fail to get versions, we reliably return a valid fallback semver
 *   for new projects to start at.
 * @return {semver} Version
 */
function getLatestVersion() {
  const fallbackVersion = '0.0.1';
  const gitDescribeVersion = getGitDescribeVersion();
  const packageVersion = getPackageVersion();

  /** Put all non-null versions into an array */
  const versions = [gitDescribeVersion, packageVersion, fallbackVersion].filter(isNotNull);
  /** Get the latest semantic version from the array */
  let latestVersion = versions.sort(semver.rcompare)[0];

  /**
   * If latest == git describe, developer did not bump version,
   * so we need to bump it.
   */
  if (isNotNull(gitDescribeVersion)) {
    if (semver.eq(gitDescribeVersion, latestVersion)) {
      latestVersion = semver.inc(latestVersion, 'patch');
    }
  }
  console.log(`${latestVersion} will be the released version`);
  return latestVersion;
}

/**
 * Tags specific version in git.
 * @param {semver} version
 * @param {string} message Git commit message
 */
// eslint-disable-next-line no-unused-vars
function tagGitVersion(version, message) {
  /** npm has default 'v' prefix for tags. We don't. */
  const gitTagPrefix = '';
  const versionTag = `${gitTagPrefix}${version}`;

  const gitTagProc = spawn('git', ['tag', '-a', versionTag, '-m', message]);
  if (gitTagProc.status !== 0) {
    console.log('git tag failed');
  }
  console.log(gitTagProc.stdout.toString());
}

/**
 * Creates a git commit with the changed files.
 * @param {string} message Git commit message
 */
// eslint-disable-next-line no-unused-vars
function gitCommit(message) {
  /**
   * Add all changed files to git. Should be only package.json and
   * maybe npm-shrinkwrap.json.
   */
  const gitAddProc = spawn('git', ['add', '.']);
  if (gitAddProc.status !== 0) {
    console.log('git add . failed');
  }
  console.log(gitAddProc.stdout.toString());
  const gitCommitProc = spawn('git', ['commit', '-m', message]);
  if (gitCommitProc.status !== 0) {
    console.log('git commit failed');
  }
  console.log(gitCommitProc.stdout.toString());
}

/**
 * Sets version in package.json.
 * @param {semver} version
 */
function setNpmVersion(version) {
  const npmVersionProc = spawn('npm', ['--no-git-tag-version', 'version', version]);
  if (npmVersionProc.status !== 0) {
    console.log('npm version failed');
  }
  console.log(npmVersionProc.stdout.toString());
}

/**
 * Makes sure the code repository gets a new version tag.
 */
function main() {
  const messageTemplate = 'Release %s';
  const latestVersion = getLatestVersion();
  const commitMessage = messageTemplate.replace(/%s/g, latestVersion);

  setNpmVersion(latestVersion);
  gitCommit(commitMessage);
  tagGitVersion(latestVersion, commitMessage);
}

main();
