# Reliable version bump
![Travis CI status](https://api.travis-ci.org/stanislavb/reliable-bump.svg)

## Goal
Automate as much of app versioning as reasonable to lower development overhead.

## Assumption
Developer wants project version to be incremented, even if the developer forgets to do it in the code.

Sometimes developer wants to increment to a specific version.

The version should be reflected in package.json and in a git tag.

## Method
Fetch latest version tagged in git

Fetch version in package.json

If they are the same, bump patch version.

[Currently not implemented] If package.json already has a higher version than git, respect it.

When versions are not found, fall back on 0.0.1.

Git tag and commit.
