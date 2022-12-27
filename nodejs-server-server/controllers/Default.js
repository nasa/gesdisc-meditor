'use strict'

var utils = require('../utils/writer.js')
var Default = require('../service/DefaultService')

module.exports.getCsrfToken = function getCsrfToken(req, res, next) {
    Default.getCsrfToken()
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
