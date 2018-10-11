const fs = require('fs')
const package = require('../package.json')
const { bump, git } = require('../node_modules/version-bump-prompt/lib/index')

function init() {
    console.log('Releasing a new version...')   
    
    let info = bump('package.json', 'minor', {
        preid: 'beta',
    })

    console.log(info)

    git(['package.json'], {
        commit: true,
        tag: true,
        push: false,
    })
}

init()
