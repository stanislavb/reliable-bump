#!/bin/bash

# Check that we're on the master branch
if [ "${TRAVIS_BRANCH}" != "master" ]; then
    echo "Branch is not master"
    exit 1
fi

# Git config
#git config user.name "Travis CI"
#git config user.email "$COMMIT_AUTHOR_EMAIL"

# Minimum viable bump
npm version patch

# Push to remote
git push --verbose --follow-tags deploy master
