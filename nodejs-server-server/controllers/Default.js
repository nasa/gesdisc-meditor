'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.getDocument = function getDocument (req, res, next) {
  var model = req.swagger.params['model'].value;
  var title = req.swagger.params['title'].value;
  var version = req.swagger.params['version'].value;
  Default.getDocument(model,title,version)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getDocumentHistory = function getDocumentHistory (req, res, next) {
  var model = req.swagger.params['model'].value;
  var title = req.swagger.params['title'].value;
  Default.getDocumentHistory(model,title)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getModel = function getModel (req, res, next) {
  var name = req.swagger.params['name'].value;
  Default.getModel(name)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listDocuments = function listDocuments (req, res, next) {
  var model = req.swagger.params['model'].value;
  Default.listDocuments(model)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listModels = function listModels (req, res, next) {
  var properties = req.swagger.params['properties'].value;
  Default.listModels(properties)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putDocument = function putDocument (req, res, next) {
  var file = req.swagger.params['file'].value;
  Default.putDocument(file)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putModel = function putModel (req, res, next) {
  var file = req.swagger.params['file'].value;
  Default.putModel(file)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
