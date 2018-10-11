const path = require('path')
const fs = require('fs')
const { bump, git } = require('../node_modules/version-bump-prompt/lib/index')

const VERSION_FILE_PATH = '../src/environments/version.ts'

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

function updateEnvironmentFilesWithVersion() {
    let package = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    let src = `export const version = '${package.version}'`

    fs.writeFileSync(path.join(`${__dirname}/${VERSION_FILE_PATH}`), src, { flat: 'w' })
}

bumpVersionNumber()
commitAndTagNewVersion()
updateEnvironmentFilesWithVersion()
