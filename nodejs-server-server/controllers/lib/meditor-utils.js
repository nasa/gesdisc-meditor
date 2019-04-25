var _ = require('lodash');
var transliteration = require('transliteration');
var mongo = require('mongodb');
var stream = require('stream');
var mustache = require('mustache');
var he = require('he');
var ObjectID = mongo.ObjectID;
var mFile = require('./meditor-mongo-file'); 

const NotificationQueueCollectionName = 'queue-notifications';
module.exports.WORKFLOW_ROOT = 'Init';
module.exports.WORKFLOW_ROOT_EDGE = {source: 'Init', target: 'Draft'};

// For a given document and metadata, returns a unique file name,
// to be used when storing the file on the file system
module.exports.getFSFileName = function getFileName(modelMeta, doc) {
  var fileName = [modelMeta.titleProperty, doc[modelMeta.titleProperty], _.get(doc, "x-meditor.modifiedOn", (new ObjectID()).toString())].join('_');
  fileName == transliteration.slugify(fileName); // Unused for now
  return (new ObjectID).toString();
};

// Stores a string 'data' attribute witha a given 'metadata' object on GridFS
// If a file with a given 'filename' already exists on FS - the original file
// is removed and replaced with the new one
module.exports.putFileSystemItem = function putFileSystemItem(dbo, filename, data, meta) {
  var options = meta ? {
    metadata: meta
  } : null;
  var putItemHelper = function (bucket, resolve, reject) {
    var writeStream = bucket.openUploadStreamWithId(filename, filename, options);
    var s = new stream.Readable();
    s.push(data);
    s.push(null); // Push null to end stream
    s.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  };
  return new Promise(function (resolve, reject) {
    var bucket = new mongo.GridFSBucket(dbo);
    bucket.find({_id: filename}).count(function (err, count) {
      if (err) return reject(err);
      if (count > 0) {
        bucket.delete(filename, function (err) {
          if (err) {
            reject(err);
          } else {
              putItemHelper(bucket, resolve, reject);
          }
        })
      } else {
        putItemHelper(bucket, resolve, reject);
      }
    }, reject);
  });
};

// A test driver for FS storage functions
function testFs() {
  var MongoClient = mongo.MongoClient;
  var MongoUrl = 'mongodb://localhost:27017';
  var DbName = 'test';
  MongoClient.connect(MongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DbName);
    putFileSystemItem(dbo, 'test', 'this is a test')
    .then(function(a) {
      console.log('Wrote a gridFS file with metadata:', a);
      return mFile.getFileSystemItem(dbo, 'test')
    })
    .then(function(a) {
      console.log('Got data back from a gridFS file:', a);
      db.close();
    })
    .catch(function(e) {
      console.log(e);
      db.close();
    })
  });
}

// Inserts a data message into DB queue of connectors
module.exports.addToConnectorQueue = function addToConnectorQueue(meta, DbName, target, data) {
  return meta.dbo.db(DbName).collection('queue-connectors').insertOne({
    created: Date.now(),
    target: target,
    data: data,
  });
};

// Converts dictionary params back into URL params
module.exports.serializeParams = function serializeParams(params, keys) {
  return _(params)
  .pickBy(function(val,key) {return (!!keys ? keys.indexOf(key) !== -1 : true) && !_.isNil(val);})
  .map(function(val, key) {return key + "=" + encodeURIComponent(val);}).value().join('&')
}

// Create a DB message for the notifier daemon to mail to relevant users
module.exports.notifyOfStateChange = function notifyOfStateChange(DbName, meta) {
  var that = {};
  var targetEdges = _(meta.workflow.edges).filter(function(e) {return e.source === meta.params.state;}).uniq().value();
  var targetNodes = _(targetEdges).map('target').uniq().value();
  var targetRoles = _(targetEdges).map('role').uniq().value();
  var tos;
  var tosusers;
  // User: who sent action, including emailAddress, firstName, lastName
  var notificationTemplate = mustache.render(meta.model.notificationTemplate || '', meta.document);
  var notification = {
    "to": [ ], // This is set later
    "cc": [ ], // This is set later
    "subject": meta.params.model + " document is now " + meta.params.state,
    "body":
      "An " + meta.params.model + " document drafted by ###AUTHOR### has been marked by " + meta.currentEdge.role + " "
      + meta.user.firstName + ' ' + meta.user.lastName
      + " as '" + meta.currentEdge.label + "' and is now in a '"
      + meta.currentEdge.target + "' state." 
      + " An action is required to transition the document to one of the [" + targetNodes.join(', ') + "] states."
      + he.decode(notificationTemplate),
    "link": {
        label: meta.params.title,
        url: process.env.APP_UI_URL + "/#/document/edit?" + module.exports.serializeParams(meta.params, ['title', 'model', 'version'])
    },
    "createdOn": (new Date()).toISOString()
  };

  return Promise.resolve()
    .then(function() {
      return meta.dbo
        .db(DbName)
        .collection('Users')
        .aggregate(
          [{$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
          {$group: {_id: '$id', doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
          {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
          {$unwind: '$roles'},
          {$match: {'roles.model': meta.params.model, 'roles.role': {$in: targetRoles}}},
          {$group: {_id: null, ids: {$addToSet: "$id"}}}
        ])
        .toArray();
    })
    .then(function(users) {
       // TOs are all users that have a right to transition the document into a new state
      if (users.length === 0) throw {message: 'Could not find addressees to notify of the status change', status: 400};
      tos = _(users[0].ids).uniq().value();
      return meta.dbo
        .db(DbName)
        .collection('users-urs')
        .find({uid: {$in: tos}})
        .project({_id:0, emailAddress: 1, firstName: 1, lastName: 1, uid: 1})
        .toArray();
    })
    .then(users => {
       // ccs are the original author and the person who just made the state change, unless they are already in TO
      var ccs =  _([meta.user.uid, meta.document['x-meditor'].modifiedBy]).uniq().difference(tos).value();
      tosusers = users;
      notification.to = _.uniq(users.map(u => '"'+ u.firstName + ' ' + u.lastName + '" <' + u.emailAddress + '>'));
      if (notification.to.length === 0) throw {message: 'Could not find addressees to notify of the status change', status: 400};
      return meta.dbo
        .db(DbName)
        .collection('users-urs')
        .find({uid: {$in: ccs}})
        .project({_id:0, emailAddress: 1, firstName: 1, lastName: 1, uid: 1})
        .toArray();
      })
    .then(users => {
      // Replace author's name placeholder with an actual name (find it in either users or tosusers)
      var author = _.filter(users, {uid: meta.document['x-meditor'].modifiedBy});
      if (author.length === 0) author = _.filter(tosusers, {uid: meta.document['x-meditor'].modifiedBy});
      if (author.length > 0) {
        notification.body = notification.body.replace(
          '###AUTHOR###',
          _.map(author, function(u) {return u.firstName + ' ' + u.lastName})[0]
        );
      } else {
        notification.body = notification.body.replace('drafted by ###AUTHOR### ', ''); // Should not be here, but just in case...
      }
      notification.cc = _.uniq(users.map(u => '"'+ u.firstName + ' ' + u.lastName + '" <' + u.emailAddress + '>'));
      return meta.dbo.db(DbName).collection(NotificationQueueCollectionName).insertOne(notification);
    });
};

// Finds a shortest path between all nodes of a given graph
// https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
function floydWarshallWithPathReconstruction(workflow) {
  // Creates a 2D array 
  function makeArray(d1, d2) {
    var arr = new Array(d1), i, l;
    for(i = 0, l = d2; i < l; i++) {
        arr[i] = new Array(d1);
    }
    return arr;
  };
  var inf = 10000000; // Infinity
  var nodeIndex = {}; // Maps states to indices
  var reverseNodeIndex; // Maps indices back to states
  var nodeRank = {}; // A dictionary containing rank of each state in topologically ordered workflow (starting from Init)
  var i, j, k;
  var dist = makeArray(workflow.nodes.length, workflow.nodes.length);
  var next = makeArray(workflow.nodes.length, workflow.nodes.length);
  // let dist be a   array of minimum distances initialized to   (infinity)
  // let next be a   array of vertex indices initialized to null
  for (i = 0; i < workflow.nodes.length; i++) {
    for (j = 0; j < workflow.nodes.length; j++) {
      dist[i][j] = inf;
      next[i][j] = null;
    }
  };
  // Compute node lookup tables
  for (i = 0; i < workflow.nodes.length; i++) {
    nodeIndex[workflow.nodes[i].id] = i;
  }
  reverseNodeIndex = Object.keys(nodeIndex).reduce(function(acc, curr) {acc[nodeIndex[curr]] = curr; return acc;},{});
  // Initialize adjacency matrix
  workflow.edges.forEach(edge => {
    dist[nodeIndex[edge.source]][nodeIndex[edge.target]] = 1;  // the weight of the edge (u,v)
    // dist[nodeIndex[edge.target]][nodeIndex[edge.source]] = 1;
    next[nodeIndex[edge.source]][nodeIndex[edge.target]] = nodeIndex[edge.target];
  });
  workflow.nodes.forEach(v => {
        dist[nodeIndex[v.id]][nodeIndex[v.id]] = 0
        next[nodeIndex[v.id]][nodeIndex[v.id]] = nodeIndex[v.id]
  });
  // Standard Floyd-Warshall implementation, O(n^3)
  for (k = 0; k < workflow.nodes.length; k++) {
    for (i = 0; i < workflow.nodes.length; i++) {
      for (j = 0; j < workflow.nodes.length; j++) {
        if (dist[i][j] > dist[i][k] + dist[k][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }
  // Compute topological ordering of nodes starting from Init (currently unused)
  for (i = 0; i < workflow.nodes.length; i++) {
    nodeRank[reverseNodeIndex[i]] = dist[0][i];
  }
  // Return node look dictionary, matrix of distances, matrix of successors, and topological ordering ranks
  return {nodeIndex: nodeIndex, reverseNodeIndex: reverseNodeIndex, nodeRank: nodeRank, dist: dist, next: next};
};

// Auxiliary procedure for finding shortest path in graph between
// two nodes using a successor matrix computed by the Floyd-Warshall
// algorithm. Modified to return a list of states, e.g.,
// [Init, Draft, Published]
function getWorkflowPath(workflowPaths, source, target) {
  var u = workflowPaths.nodeIndex[source];
  var v = workflowPaths.nodeIndex[target];
  var path = [source];
  if (workflowPaths.next[u][v] === null) return [];
  while (u !== v) {
    u = workflowPaths.next[u][v];
    path.push(workflowPaths.reverseNodeIndex[u]);
  };
  return path;
};

// A helper function that, given an shortest paths matrix in the old
// workflow and the new workflow, computes a mapping from an edge in
// the old workflow to an edge or a chain of edges in the new workflow
// The resulting mapping is stored in the meta.edgeMapping dictionary
// meta.edgeMapping[oldEdge.source][oldEdge.target] = [edge1, edge2, .., edgeN];
function computeAndAddEdgeMapping(meta, workflowRoot, oldEdge) {
  // Steps:
  // 1. Find a shortest path from Init to the old edge's source in the
  //    old workflow. The path consists of the nodes in the old workflow.
  // 2. Iterate the path back to Init node until we find a node on the path
  //    that exists in both the old and the new workflow. This node becomes
  //    the source of the mapped edge. In the worst case, we will simply 
  //    retrace all the way back to Init.
  // 3. Append the target of the old edge to the path from (1) and again
  //    iterate the path back until we find a node that exists in both
  //    workflows. This will be the target of the mapped edge.
  // 4. Find the shortest path between the new source and the new target
  //    in the new workflow.
  // 5. If the path does not exists or consists of a single node (basically,
  //    source and target are the same), set the mapping to []
  // 6. Otherwise, set the mapping to a chain of edges forming the path,
  //    e.g., [Init, Draft, Published] path becomes a mapping of
  //    [{Init->Draft}, {Draft->Published}]
  var i;
  var newEdge = {};
  // Compute shortest path in the old workflow between Init and old Source
  var path = getWorkflowPath(meta.workflows[meta.oldModel.workflow].paths, workflowRoot, oldEdge.source );
  // Find mapping from old Source to the new Source, basically a node that
  // exists in both workflows and appears earlier or the same in the 'approval
  // sequence' of the old workflow as the old Source
  for (i = path.length - 1; i >= 0; i--) {
    if (path[i] in meta.workflows[meta.newModel.workflow].paths.nodeIndex) {
      newEdge.source = path[i];
      break;
    }
  };
  // Find mapping from old Target to the new Target, basically a node that
  // exists in both workflows and appears earlier or the same in the 'approval
  // sequence' of the old workflow as the old Target
  path.push(oldEdge.target);
  for (i = path.length - 1; i >= 0; i--) {
    if (path[i] in meta.workflows[meta.newModel.workflow].paths.nodeIndex) {
      newEdge.target = path[i];
      break;
    }
  };
  // Compute shortest path in the new workflow between new Source and new Target
  path = getWorkflowPath(meta.workflows[meta.newModel.workflow].paths, newEdge.source, newEdge.target );
  // Init mapping dictionary
  if (!meta.edgeMapping[oldEdge.source]) meta.edgeMapping[oldEdge.source] = {};
  meta.edgeMapping[oldEdge.source][oldEdge.target] = [];
  // Add a chain of edges on the path between the new Source and the new Target
  if (path !== null && path.length > 1) {
    for (i = 0; i < path.length - 1; i ++) {
      meta.edgeMapping[oldEdge.source][oldEdge.target].push({source: path[i], target: path[i + 1]});
    }
  }
};

function handleModelChanges(meta, DbName, modelDoc) {
  // 1. Get the ultimate version of the model
  // 2. Get pen-ultimate version of the model
  // 3. Compare 'workflow' fields
  // 4. Stop if workflow field did not change
  // 5. Fetch old workflow and new workflow (latest versions for both)
  // 6. Compute mapping:
  //    edge in old workflow -> set of edges forming a path in new workflow
  //    this is done by comparing shortest paths between source and target
  //    in the old workflow and the new workflow
  // 7. Iterate through all documents of the model
  //   7.a. Iterate through state change history
  //   7.b. Replace every edge (transition) according to the mapping
  //   7.c. Collapse duplicate adjuscent transitions
  
  console.log('Remapping state change history for documents in ' + modelDoc.name);
  const workflowRoot = module.exports.WORKFLOW_ROOT;
  const workflowRootEdge = module.exports.WORKFLOW_ROOT_EDGE;
  return Promise.resolve()
    .then(function() {
      return meta.dbo
        .db(DbName)
        .collection('Models')
        .aggregate(
          [ {$match: {name: modelDoc.name}},
            {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
            {$addFields: {'x-meditor.state': { $arrayElemAt: [ "$x-meditor.states.target", -1 ]}}}, // Find last state
            {$limit: 2}
        ])
        .toArray();
    })
    .then(function(res) {
      if (res.length < 2) return Promise.reject({result: {}});
      if (res[0].workflow === res[1].workflow) return Promise.reject({result: {}});
      var workflowNames = res.map(r => r.workflow);
      meta.newModel = res[0];
      meta.oldModel = res[1];
      return meta.dbo
        .db(DbName)
        .collection('Workflows')
        .aggregate([
          {$match: {name: {$in: workflowNames}}},
          {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
          {$group: {_id: '$name', doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
          {$replaceRoot: { newRoot: "$doc"}} // Put all fields of the most recent doc back into root of the document
        ])
        .sort({'x-meditor.modifiedOn': -1})
        .toArray();
    })
    .then(function(res) {
      meta.workflows = res.reduce(function (accumulator, currentValue) {
        accumulator[currentValue.name] = {
          workflow: currentValue,
          paths: floydWarshallWithPathReconstruction(currentValue)
        }
        return accumulator;
      }, {})
      meta.edgeMapping = {}; // Mapping is a two-level dictionary, e.g., {Draft: {Review: {from: Draft, to: Published}}
      // console.log(getWorkflowPath(workflows['Edit-Publish'].paths,'Draft', 'Published' ));
      meta.workflows[meta.oldModel.workflow].workflow.edges.forEach(oldEdge => {
        computeAndAddEdgeMapping(meta, workflowRoot, oldEdge);
      });
      return meta.dbo
        .db(DbName)
        .collection(modelDoc.name)
        .find()
        .toArray();
    })
    .then(function(res) {
      // Iterate through all documents of the changed model and remap their state history
      var updateQueue = [];
      res.forEach(doc => {
        var oldHistory = _.cloneDeep(doc['x-meditor']['states']);
        var newStateHistory = [];
        // console.log('Old history: ', JSON.stringify(doc['x-meditor']['states'], null, 2));
        doc['x-meditor']['states'].forEach(oldEdge => {
          // Some edges might not be in the old workflow, e.g., a result of a botched import etc,
          // see if we can still compute a mapping
          if (!meta.edgeMapping[oldEdge.source] || !meta.edgeMapping[oldEdge.source][oldEdge.target]) computeAndAddEdgeMapping(meta, workflowRoot, oldEdge);
          // Discard an edge if there is no mapping
          if (!meta.edgeMapping[oldEdge.source] || !meta.edgeMapping[oldEdge.source][oldEdge.target]) return;
          // Add all edges from the mapping edge chain to the history, preserving extraneous attributes
          // and discarding duplicate edges
          meta.edgeMapping[oldEdge.source][oldEdge.target].forEach(edge => {
            var historyLast = null;
            var mappedEdge;
            if (newStateHistory.length !== 0) historyLast = newStateHistory[newStateHistory.length - 1];
            if (!historyLast || !(historyLast.source === edge.source && historyLast.target === edge.target)) {
              if (edge.source === oldEdge.source && edge.target === oldEdge.target) {
                // The old edge is exactly the same as the new edge, just push it as-is
                newStateHistory.push(oldEdge);
              } else {
                // Otherwise, copy attributes from the old edge to the new edge
                mappedEdge = _.cloneDeep(oldEdge);
                mappedEdge.source = edge.source;
                mappedEdge.target = edge.target;
                mappedEdge.notes = 'Mapped from [' + oldEdge.source + ', ' + oldEdge.target + ']';
                newStateHistory.push(mappedEdge);
              }
            }
          });
          return oldEdge;
        });
        // If the new state history came back empty - set it to the default Init->Draft edge
        if (newStateHistory.length === 0) {
          newStateHistory = [_.cloneDeep(workflowRootEdge)];
          newStateHistory[0].modifiedOn = doc['x-meditor']['modifiedOn'];
          newStateHistory[0].notes = 'Failed to map old workflow to the new workflow, falling back on init edge';
        }
        // console.log('New history: ', JSON.stringify(newStateHistory, null, 2), '-------------------------\n\n\n');
        // Update the document in the database
        updateQueue.push(meta.dbo
          .db(DbName)
          .collection(modelDoc.name)
          .updateOne({_id: doc._id}, {$set: {'x-meditor.states': newStateHistory, 'x-meditor.backupStates': oldHistory}})
        );
        updateQueue.push(Promise.resolve());
      });
      // Wait for all update transactions to complete
      return Promise.all(updateQueue);
    })
    .then(function(res) {
      console.log('Done updating state history for documents in ' + modelDoc.name);
      // Re-publish documents as necessary, since some of the states could have changed
      return exports.addToConnectorQueue(meta, DbName, 'uui', {model: modelDoc.name}); // Take an opportunity to sync with UUI
    })
    .catch(function(e) {
      if (_.isObject(e) && e.result) {
        // Exited the promise chain (not an actual error)
        return Promise.resolve(e.result);
      }
      console.log(e);
      return Promise.reject(e);
    });
};

module.exports.actOnDocumentChanges = function actOnDocumentChanges(meta, DbName, doc) {
  if (doc["x-meditor"]["model"] === 'Models') return handleModelChanges(meta, DbName, doc);
  return Promise.resolve();
};

// This is used for developing / testing purposes
module.exports.testStub = function() {
  // var defaultStateName = "Unspecified";
  // var defaultState = {target: defaultStateName, source: defaultStateName, modifiedBy: 'Unknown', modifiedOn: (new Date()).toISOString()};
  var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
  var MongoClient = mongo.MongoClient;
  MongoClient.connect(MongoUrl, function(err, db) {
    var DbName = "meditor";
    if (err) {
      console.log(err);
      throw err;
    }
    var dbo = db;
    var meta = {
      dbo: dbo
    }
    module.exports.actOnDocumentChanges(meta, DbName, {name: 'News', 'x-meditor': {model: 'Models'}});
  });
};

