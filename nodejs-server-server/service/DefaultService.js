'use strict'

/**
 * Change the state of a document
 * Change the state of a document; modifies the state of a document by a privileged user
 *
 * model String Name of the Model
 * title String Title of the document
 * state String Target state of the document
 * version String Version of the document (optional)
 * returns Object
 **/
exports.changeDocumentState = function (model, title, state, version) {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = '{}'
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Gets a new csrf token
 * Gets a new csrf token
 *
 * returns csrf
 **/
exports.getCsrfToken = function () {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = {
            csrfToken: 'SFfkaSD-dksfjfjsSKJ33DN-fdS-fSf',
        }
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Gets a document
 * Gets a document
 *
 * model String Name of the Model
 * title String Title of the document
 * version String Version of the document (optional)
 * returns Object
 **/
exports.getDocument = function (model, title, version) {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = '{}'
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Gets user info
 * Gets user info
 *
 * returns user
 **/
exports.getMe = function () {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = {
            name: 'John Doe',
        }
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Gets a Model
 * Gets a Model object
 *
 * name String Name of the model
 * returns model
 **/
exports.getModel = function (name) {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = {
            schema: 'schema',
            layout: 'layout',
            titleField: 'titleField',
            documentation: 'documentation',
            name: 'name',
            icon: {
                color: 'color',
                name: 'name',
            },
            'x-meditor': {
                modifiedOn: 'modifiedOn',
                count: 'count',
                modifiedBy: 'modifiedBy',
                title: 'title',
            },
            description: 'description',
            tag: ['tag', 'tag'],
        }
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Login
 * Redirect to configured identity provider for login
 *
 * code String URS authentication code (optional)
 * returns success
 **/
exports.login = function (code) {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = {
            code: 0,
            description: 'description',
        }
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Login Post
 * Log in with username and password to Cognito
 *
 *
 * returns success
 **/
exports.loginPost = function (loginInfo) {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = {}
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Logout
 * Logs out the user
 *
 * returns success
 **/
exports.logout = function () {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = {
            code: 0,
            description: 'description',
        }
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Puts a document
 * Puts a document
 *
 * file File Uploaded document file (JSON)
 * returns success
 **/
exports.putDocument = function (file) {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = {
            code: 0,
            description: 'description',
        }
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}

/**
 * Clones a document
 * Clones a document
 *
 * model String Name of the Model
 * title String Title of the document to clone
 * newTitle String Title of the new document
 * returns Object
 **/
exports.cloneDocument = function (model, title, newTitle) {
    return new Promise(function (resolve, reject) {
        var examples = {}
        examples['application/json'] = '{}'
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]])
        } else {
            resolve()
        }
    })
}
