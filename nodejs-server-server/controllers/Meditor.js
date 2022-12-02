'use strict'

var log = require('log')
var _ = require('lodash')
var utils = require('../utils/writer')
var mongo = require('mongodb')
var MongoClient = mongo.MongoClient
var ObjectID = mongo.ObjectID
var jsonpath = require('jsonpath')
var macros = require('./Macros')
var Validator = require('jsonschema').Validator
var nats = require('./lib/nats-connection')
var escape = require('mongo-escape').escape

var MongoUrl = process.env.MONGOURL || 'mongodb://meditor_database:27017/'
var DbName = 'meditor'

var SHARED_MODELS = ['Workflows', 'Users', 'Models']

// subscribe to publication acknowledgements
nats.subscribeToChannel('meditor-Acknowledge').on(
    'message',
    handlePublicationAcknowledgements
)

// ======================== Common helper functions ================================

// Wrapper to parse JSON giving v8 a chance to optimize code
function safelyParseJSON(jsonStr) {
    var jsonObj
    try {
        jsonObj = JSON.parse(jsonStr)
    } catch (err) {
        throw err
    }
    return jsonObj
}

// Converts Swagger parameter notation into a plain dictionary
function getSwaggerParams(request) {
    var params = {}
    if (_.get(request, 'swagger.params', null) === null) return params
    for (var property in request.swagger.params) {
        params[property] = request.swagger.params[property].value
    }
    return params
}

function handleResponse(response, res, defaultStatus, defaultMessage) {
    var status = res.status || defaultStatus
    var result = res
    if (_.isNil(res)) result = defaultMessage
    if (_.isObject(res) && _.get(res, 'message', null) !== null) result = res.message
    if (_.isString(result)) {
        result = { code: status, description: result }
    }

    if (res.errors) {
        result.errors = res.errors
    }

    utils.writeJson(response, result, status)
}

function handleError(response, err) {
    // if the error message contains a list of errors, remove them for the console message so we don't pollute the logs
    // these errors will remain visible in the API response
    let consoleError = Object.assign({}, err)
    delete consoleError.errors

    console.log('Error: ', err)
    handleResponse(response, err, 500, 'Unknown error')
}

function handleSuccess(response, res) {
    handleResponse(response, res, 200, 'Success')
}

function handleNotFound(response, res) {
    handleResponse(response, res, 404, 'Not found')
}

function handleBadRequest(response, res) {
    handleResponse(response, res, 400, 'Bad Request')
}

/**
 * handles success/failure messages received from the NATS acknowledgements queue
 * @param {*} message
 */
async function handlePublicationAcknowledgements(message) {
    let acknowledgement

    try {
        acknowledgement = escape(JSON.parse(message.getData()))
    } catch (err) {
        // the subscriber sent us a message that wasn't JSON parseable
        log.error('Failed to parse the following publication acknowledgement:')
        log.error(message.getData())

        message.ack() // acknowledge the message so NATS doesn't keep trying to send it
        return
    }

    log.debug('Acknowledgement received, processing now ', acknowledgement)

    let client = new MongoClient(MongoUrl)

    await client.connect()

    try {
        const publicationStatus = {
            ...(acknowledgement.url && { url: acknowledgement.url }),
            ...(acknowledgement.redirectToUrl && {
                redirectToUrl: acknowledgement.redirectToUrl,
            }),
            ...(acknowledgement.message && { message: acknowledgement.message }),
            ...(acknowledgement.target && { target: acknowledgement.target }),
            ...(acknowledgement.statusCode && {
                statusCode: acknowledgement.statusCode,
            }),
            ...(acknowledgement.statusCode && {
                [acknowledgement.statusCode == 200 ? 'publishedOn' : 'failedOn']:
                    Date.now(),
            }),
        }

        const db = client.db(DbName).collection(acknowledgement.model)

        // remove any existing publication statuses for this target (for example: past failures)
        await db.updateOne(
            {
                _id: ObjectID(acknowledgement.id),
            },
            {
                $pull: {
                    'x-meditor.publishedTo': {
                        target: acknowledgement.target,
                    },
                },
            }
        )

        // update document state to reflect publication status
        await db.updateOne(
            {
                _id: ObjectID(acknowledgement.id),
            },
            {
                $addToSet: {
                    'x-meditor.publishedTo': publicationStatus,
                },
            }
        )

        log.debug(
            'Successfully updated document with publication status ',
            publicationStatus
        )

        message.ack()
    } catch (err) {
        // whoops, the message must be improperly formatted, throw an error and acknowledge so that NATS won't try to resend
        console.error('Failed to process message', err)
        message.ack()
    } finally {
        await client.close()
    }
}

// Builds aggregation pipeline query for a given model (common starting point for most API functions)
function getDocumentAggregationQuery(meta) {
    var searchQuery = {}
    var query
    var defaultStateName = 'Unspecified'
    var defaultState = {
        target: defaultStateName,
        source: defaultStateName,
        modifiedBy: 'Unknown',
        modifiedOn: new Date().toISOString(),
    }
    var returnableStates = _.concat(meta.sourceStates, ['Unspecified'])
    if (meta.params.model) {
        if (SHARED_MODELS.indexOf(meta.params.model) !== -1)
            returnableStates = _.concat(returnableStates, meta.readyNodes) // Return ready nodes for shared models
        // need a second match
        // $not: {$and: {'x-meditor.modifiedBy': meta.user.uid, 'x-meditor.state': {$in: exclusiveStates}}}
        // if (!_.isEmpty(meta.user.uid)) filterQuery['x-meditor.modifiedBy'] = {$ne: meta.user.uid};
        query = [
            { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
            { $group: { _id: '$' + meta.titleProperty, doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
            { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
            {
                $addFields: {
                    'x-meditor.states': {
                        $ifNull: ['$x-meditor.states', [defaultState]],
                    },
                },
            }, // Add default state on docs with no states
            {
                $addFields: {
                    'x-meditor.state': {
                        $arrayElemAt: ['$x-meditor.states.target', -1],
                    },
                },
            }, // Find last state
            {
                $addFields: {
                    banTransitions: {
                        $eq: [
                            {
                                $cond: {
                                    if: {
                                        $in: [
                                            '$x-meditor.state',
                                            meta.exclusiveStates,
                                        ],
                                    },
                                    then: meta.user.uid,
                                    else: '',
                                },
                            },
                            { $arrayElemAt: ['$x-meditor.states.modifiedBy', -1] },
                        ],
                    },
                },
            }, // This computes whether a user can transition the edge if he is the modifiedBy of the current state
            { $match: { 'x-meditor.deletedOn': { $exists: false } } }, // filter out "deleted" documents

            //{$match: {'x-meditor.state': {$in: returnableStates}, 'bannedTransition': false}}, // Filter states based on the role's source states
            //{$match: {'banTransitions': false}}, // Filter states based on the role's source states
        ]
    }
    // Build up search query if search params are available
    if ('title' in meta.params) searchQuery[meta.titleProperty] = meta.params.title
    if ('version' in meta.params && meta.params.version !== 'latest')
        searchQuery['x-meditor.modifiedOn'] = meta.params.version
    if (!_.isEmpty(searchQuery)) query.unshift({ $match: searchQuery }) // Push search query into the top of the chain
    return query
}

// Collects various metadata about request and model - to be
// used in queries and what not
// TODO: split this method up to make it easier to test
function getDocumentModelMetadata(dbo, request, paramsExtra) {
    // This is a convenience function that returns a number of
    // parameters needed to work with documents:
    // - request parameters
    // - all user roles
    // - model-specific user roles
    // - model
    // - workflow
    // - title property (retrieved from model)
    // - source states available to the user
    // - target states available to the user
    // Note: if set, paramsExtra are super-imposed on top of swagger params
    var that = {
        params: _.assign(getSwaggerParams(request), paramsExtra),
        roles: _.get(request, 'user.roles', {}),
        dbo: dbo,
        user: request.user || {},
        exclusiveStates: ['Under Review', 'Approved'],
    }
    // TODO Useful for dubugging
    // that.roles = [
    //   { model: 'Alerts', role: 'Author' },
    //   { model: 'Alerts', role: 'Reviewer' } ];
    that.modelName = that.params.model
    that.modelRoles = _(that.roles)
        .filter({ model: that.params.model })
        .map('role')
        .value()
    return getModelContent(that.params.model, dbo.db(DbName)) // The model should be pre-filled with Macro subs
        .then(res => {
            if (_.isEmpty(res))
                throw {
                    message: 'Model for ' + that.params.model + ' not found',
                    status: 404,
                }
            that.model = res
            that.titleProperty = that.model['titleProperty'] || 'title'
        })
        .then(res => {
            return that.dbo
                .db(DbName)
                .collection('Workflows')
                .find({ name: that.model.workflow })
                .sort({ 'x-meditor.modifiedOn': -1 })
                .limit(1)
                .toArray()
        })
        .then(res => {
            if (_.isEmpty(res))
                throw {
                    message: 'Workflow for ' + that.params.model + ' not found',
                    status: 400,
                }
            that.workflow = res[0]
            that.readyNodes = _(that.workflow.nodes)
                .pickBy({ readyForUse: true })
                .map('id')
                .value()
            that.sourceStates = _(that.workflow.edges)
                .filter(function (e) {
                    return that.modelRoles.indexOf(e.role) !== -1
                })
                .map('source')
                .uniq()
                .value()
            that.targetStates = _(that.workflow.edges)
                .filter(function (e) {
                    return that.modelRoles.indexOf(e.role) !== -1
                })
                .map('target')
                .uniq()
                .value()
            res.reduce(function (accumulator, currentValue) {
                if (currentValue.length !== 1) return accumulator
                accumulator[currentValue[0].name] = currentValue[0].count
                return accumulator
            }, {})
            that.sourceToTargetStateMap = that.workflow.edges.reduce(function (
                collector,
                e
            ) {
                if (that.modelRoles.indexOf(e.role) !== -1) {
                    if (!collector[e.source]) collector[e.source] = []
                    collector[e.source].push(e.target)
                }
                return collector
            },
            {})
            return that
        })
}

function getExtraDocumentMetadata(meta, doc) {
    var extraMeta = {
        'x-meditor': {
            targetStates: doc.banTransitions
                ? []
                : _.get(
                      meta.sourceToTargetStateMap,
                      _.get(doc, 'x-meditor.state', 'Unknown'),
                      []
                  ),
        },
    }
    return extraMeta
}

function DocumentNotFoundException(documentTitle) {
    this.message = `Document was not found: '${documentTitle}'`
    this.toString = function () {
        return this.message
    }
}

function DocumentAlreadyExistsException(documentTitle) {
    this.message = `A document already exists with the title: '${documentTitle}'`
    this.toString = function () {
        return this.message
    }
}

/**
 * retrieves a document
 * TODO: use explicit parameters, not the whole request object
 */
async function retrieveDocument(client, request, includeTitleProperty = false) {
    // get the model metadata first
    let modelMetadata = await getDocumentModelMetadata(client, request)

    // build the getDocument query
    let query = getDocumentAggregationQuery(modelMetadata)
    query.push({ $limit: 1 })

    // retrieve the document
    let results = await client
        .db(DbName)
        .collection(request.query.model)
        .aggregate(query, { allowDiskUse: true })
        .map(results => {
            // TODO: move the getExtraDocumentMetadata method contents here and simplify (not clear what it does from here)
            _.merge(results, getExtraDocumentMetadata(modelMetadata, results))
            return results
        })
        .toArray()

    let document = results && results.length ? results[0] : undefined

    if (!document) {
        throw new DocumentNotFoundException(request.query.title)
    }

    // remove unneeded fields from the response
    delete document.banTransitions

    if (includeTitleProperty) {
        document['x-meditor'].titleProperty = modelMetadata.titleProperty
    }

    return document
}

// Exported method to get a document
module.exports.getDocument = async function (request, response) {
    let client = new MongoClient(MongoUrl)

    try {
        await client.connect()

        // retrieve the document
        let document = await retrieveDocument(client, request)

        // respond with document
        handleSuccess(response, document)
    } catch (err) {
        console.error(err)

        if (err instanceof DocumentNotFoundException) {
            handleNotFound(response, err.message)
        } else {
            handleError(response, err)
        }
    } finally {
        client.close()
    }
}

// Internal method to list documents
function getModelContent(name, dbo) {
    return new Promise(function (resolve, reject) {
        dbo.collection('Models')
            .find({ name: name })
            .sort({ 'x-meditor.modifiedOn': -1 })
            .project({ _id: 0 })
            .toArray(function (err, res) {
                if (err) {
                    console.log(err)
                    reject(err)
                }

                // Fill in templates if they exist
                var promiseList = []
                if (res[0] && res[0].hasOwnProperty('templates')) {
                    res[0].templates.forEach(element => {
                        var macroFields = element.macro.split(/\s+/)
                        promiseList.push(
                            new Promise(function (promiseResolve, promiseReject) {
                                if (typeof macros[macroFields[0]] === 'function') {
                                    macros[macroFields[0]](
                                        dbo,
                                        macroFields.slice(1, macroFields.length)
                                    )
                                        .then(function (response) {
                                            promiseResolve(response)
                                        })
                                        .catch(function (err) {
                                            console.log(err)
                                            promiseReject(err)
                                        })
                                } else {
                                    console.log(
                                        "Macro, '" + macroName + "', not supported"
                                    )
                                    promiseReject(
                                        "Macro, '" + macroName + "', not supported"
                                    )
                                }
                            })
                        )
                    })
                    Promise.all(promiseList)
                        .then(response => {
                            try {
                                var schema = JSON.parse(res[0].schema)
                                var layout =
                                    res[0].layout && res[0].layout != ''
                                        ? JSON.parse(res[0].layout)
                                        : null

                                var i = 0
                                res[0].templates.forEach(element => {
                                    let replaceValue = response[i++]

                                    jsonpath.value(
                                        schema,
                                        element.jsonpath,
                                        replaceValue
                                    )

                                    if (layout) {
                                        jsonpath.value(
                                            layout,
                                            element.jsonpath,
                                            replaceValue
                                        )
                                        res[0].layout = JSON.stringify(
                                            layout,
                                            null,
                                            2
                                        )
                                    }

                                    res[0].schema = JSON.stringify(schema, null, 2)
                                })
                                resolve(res[0])
                            } catch (err) {
                                console.error('Failed to parse schema', err)
                                reject(err)
                            }
                        })
                        .catch(function (err) {
                            reject(err)
                        })
                } else {
                    resolve(res[0])
                }
            })
    })
}

module.exports.getModel = async function (request, response, next) {
    let client = new MongoClient(MongoUrl)

    try {
        await client.connect()

        let dbo = await client.db(DbName)

        const model = await getModelContent(request.query.name, dbo)

        if (!model) throw new Error('Model not found')

        handleSuccess(response, model)
    } catch (err) {
        console.error(err)
        handleError(response, err)
    } finally {
        client.close()
    }
}
