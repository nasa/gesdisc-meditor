const fs = require('fs')
const { bump, git } = require('../node_modules/version-bump-prompt/lib/index')

function bumpVersionNumber() {
    bump('package.json', 'minor', {
        preid: 'beta',
    })
}

function commitAndTagNewVersion() {
    git(['package.json'], {
        commit: true,
        tag: true,
        push: false,
    })
}

function addVersionToUi() {
    console.log('adding')
}

//bumpVersionNumber()
//commitAndTagNewVersion()
addVersionToUi()
