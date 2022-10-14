'use strict'

var utils = require('../utils/writer.js')
var Default = require('../service/DefaultService')

module.exports.changeDocumentState = function changeDocumentState(req, res, next) {
    var model = req.swagger.params['model'].value
    var title = req.swagger.params['title'].value
    var state = req.swagger.params['state'].value
    var version = req.swagger.params['version'].value
    Default.changeDocumentState(model, title, state, version)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.getCsrfToken = function getCsrfToken(req, res, next) {
    Default.getCsrfToken()
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.getDocument = function getDocument(req, res, next) {
    var model = req.swagger.params['model'].value
    var title = req.swagger.params['title'].value
    var version = req.swagger.params['version'].value
    Default.getDocument(model, title, version)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.getDocumentPublicationStatus = function getDocumentPublicationStatus(
    req,
    res,
    next
) {
    var model = req.swagger.params['model'].value
    var title = req.swagger.params['title'].value
    Default.getDocumentPublicationStatus(model, title)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.getDocumentHistory = function getDocumentHistory(req, res, next) {
    var model = req.swagger.params['model'].value
    var title = req.swagger.params['title'].value
    Default.getDocumentHistory(model, title)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.getMe = function getMe(req, res, next) {
    Default.getMe()
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.getModel = function getModel(req, res, next) {
    var name = req.swagger.params['name'].value
    Default.getModel(name)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.login = function login(req, res, next) {
    var code = req.swagger.params['code'].value
    Default.login(code)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.loginPost = function loginPost(req, res, next) {
    var loginInfo = req.swagger.params['loginInfo'].value
    Default.loginPost(loginInfo)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.logout = function logout(req, res, next) {
    Default.logout()
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.postComment = function postComment(req, res, next) {
    var file = req.swagger.params['file'].value
    Default.postComment(file)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.putDocument = function putDocument(req, res, next) {
    var file = req.swagger.params['file'].value
    Default.putDocument(file)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.cloneDocument = function cloneDocument(req, res, next) {
    var model = req.swagger.params['model'].value
    var title = req.swagger.params['title'].value
    var newTitle = req.swagger.params['newTitle'].value
    Default.cloneDocument(model, title, newTitle)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.resolveComment = function resolveComment(req, res, next) {
    var id = req.swagger.params['id'].value
    var resolvedBy = req.swagger.params['resolvedBy'].value
    Default.resolveComment(id, resolvedBy)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}

module.exports.editComment = function editComment(req, res, next) {
    var id = req.swagger.params['id'].value
    var text = req.swagger.params['text'].value
    Default.editComment(id, text)
        .then(function (response) {
            utils.writeJson(res, response)
        })
        .catch(function (response) {
            utils.writeJson(res, response)
        })
}
