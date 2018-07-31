'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.getComments = function getComments (req, res, next) {
  var title = req.swagger.params['title'].value;
  Default.getComments(title)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getCsrfToken = function getCsrfToken (req, res, next) {
  Default.getCsrfToken()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

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

module.exports.getDocumentImage = function getDocumentImage (req, res, next) {
  var model = req.swagger.params['model'].value;
  var title = req.swagger.params['title'].value;
  var version = req.swagger.params['version'].value;
  Default.getDocumentImage(model,title,version)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getMe = function getMe (req, res, next) {
  Default.getMe()
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

module.exports.login = function login (req, res, next) {
  var code = req.swagger.params['code'].value;
  Default.login(code)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.logout = function logout (req, res, next) {
  Default.logout()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postComment = function postComment (req, res, next) {
  var file = req.swagger.params['file'].value;
  Default.postComment(file)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putDocument = function putDocument (req, res, next) {
  var file = req.swagger.params['file'].value;
  var image = req.swagger.params['image'].value;
  Default.putDocument(file,image)
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

module.exports.resolveComment = function resolveComment (req, res, next) {
  var id = req.swagger.params['id'].value;
  Default.resolveComment(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
