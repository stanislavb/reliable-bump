#!/bin/bash

# Travis setup procedure
# gem install travis
# travis login
# ssh-keygen -t rsa -b 4096 -f ./.travis/deploy_key
# travis encrypt-file ./.travis/deploy_key ./.travis/deploy_key.enc --add
# rm ./.travis/deploy_key
# In Github, add deploy_key.pub contents as a deploy key with push permissions

# Check that we're on the master branch
if [ "${TRAVIS_BRANCH}" != "master" ]; then
    echo "Branch is not master"
    exit 1
fi

# Travis works in "detached head" mode, so we need to fix it first.
git fetch --all
git reset --hard deploy/master

# Use our own code
./bin/bump.js

# Push to remote
git push --verbose --follow-tags deploy master
