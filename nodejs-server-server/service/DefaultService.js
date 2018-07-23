'use strict';


/**
 * Gets comments for document
 * Gets comments for document
 *
 * title String Title of the document
 * returns Object
 **/
exports.getComments = function(title) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = "{}";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
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
exports.getDocument = function(model,title,version) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = "{}";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets a document
 * Gets a document's history
 *
 * model String Name of the Model
 * title String Title of the document
 * returns Object
 **/
exports.getDocumentHistory = function(model,title) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = "{}";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets a Model
 * Gets a Model object
 *
 * name String Name of the model
 * returns model
 **/
exports.getModel = function(name) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "schema" : "schema",
  "layout" : "layout",
  "titleField" : "titleField",
  "documentation" : "documentation",
  "name" : "name",
  "icon" : {
    "color" : "color",
    "name" : "name"
  },
  "x-meditor" : {
    "modifiedOn" : "modifiedOn",
    "count" : "count",
    "modifiedBy" : "modifiedBy",
    "title" : "title"
  },
  "description" : "description",
  "tag" : [ "tag", "tag" ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Lists documents of a given Model
 * Lists documents of a given Model
 *
 * model String Name of the Model
 * returns List
 **/
exports.listDocuments = function(model) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "x-meditor" : {
    "modifiedOn" : "modifiedOn",
    "modifiedBy" : "modifiedBy"
  },
  "title" : "title"
}, {
  "x-meditor" : {
    "modifiedOn" : "modifiedOn",
    "modifiedBy" : "modifiedBy"
  },
  "title" : "title"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Lists Models
 * Lists 'Model' objects each with an icon, description and count of number of instances of an object.
 *
 * properties List Comma-separated list of fields to be returned (optional)
 * returns List
 **/
exports.listModels = function(properties) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "schema" : "schema",
  "documentation\"" : "documentation\"",
  "name" : "name",
  "icon" : {
    "color" : "color",
    "name" : "name"
  },
  "description" : "description",
  "x-meditor" : {
    "modifiedOn" : "modifiedOn",
    "count" : 1,
    "modifiedBy" : "modifiedBy",
    "title" : "title",
    "version" : "version"
  },
  "tag" : [ "tag", "tag" ]
}, {
  "schema" : "schema",
  "documentation\"" : "documentation\"",
  "name" : "name",
  "icon" : {
    "color" : "color",
    "name" : "name"
  },
  "description" : "description",
  "x-meditor" : {
    "modifiedOn" : "modifiedOn",
    "count" : 1,
    "modifiedBy" : "modifiedBy",
    "title" : "title",
    "version" : "version"
  },
  "tag" : [ "tag", "tag" ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Puts comment for document
 * Puts comment for document
 *
 * file File Uploaded document file (JSON)
 * returns success
 **/
exports.postComment = function(file) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code" : 0,
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Puts a document
 * Puts a document
 *
 * file File Uploaded document file (JSON)
 * returns success
 **/
exports.putDocument = function(file) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code" : 0,
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Adds a Model
 * Adds a Model object
 *
 * file File Uploaded model file (JSON)
 * returns success
 **/
exports.putModel = function(file) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code" : 0,
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Resolves comment
 * Resolves comment
 *
 * id String Comment id
 * returns success
 **/
exports.resolveComment = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code" : 0,
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

