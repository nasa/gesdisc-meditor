Array.prototype.unique = function () {
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index
    })
}

exports.list = function (dbo, item) {
    return new Promise(function (resolve, reject) {
        const [model, field] = item[0].split('.')

        if (!model.match(/^\S+$/)) {
            console.log(
                "Error: collection name in '" +
                    item +
                    "' should not have white spaces"
            )
            throw (
                'Error: collection name in ' + item + ' should not have white spaces'
            )
        }
        var projection = { _id: 0 }
        projection[field] = 1
        dbo.collection(decodeURIComponent(model))
            .find({})
            .project(projection)
            .toArray(function (err, res) {
                if (err) {
                    console.log(err)
                    throw err
                } else {
                    var list = res.map(element => element[field])
                    resolve(list.unique())
                }
            })
    })
}

/**
 * generates a JSONSchema dependencies section https://json-schema.org/understanding-json-schema/reference/conditionals.html
 *
 * The macro (defined in a model's templates section) would look something like this
 *
 *      jsonPath: $.dependencies
 *      macro: listDependenciesByTitle DAAC.cmrProviders[].CmrProvider
 *
 * The above macro would get a list of all DAACs with their cmrProviders and build a dependency tree out of it.
 * Selecting a DAAC would populate the "CmrProvider" field enum with a list of only that DAAC's CMR Providers.
 */
exports.listDependenciesByTitle = async function listDependenciesByTitle(dbo, item) {
    const [model, dependentField, targetField] = item[0].split('.')
    const modelName = decodeURIComponent(model)
    const mongoField = dependentField.replace(/\[\]$/, '') // remove brackets for the mongo query if this is an array field

    if (!model.match(/^\S+$/)) {
        console.log(
            "Error: collection name in '" + item + "' should not have white spaces"
        )
        throw 'Error: collection name in ' + item + ' should not have white spaces'
    }

    const results = await dbo
        .collection(modelName)
        .aggregate([
            { $sort: { 'x-meditor.modifiedOn': -1 } }, // Sort descending by version (date)
            { $group: { _id: '$title', doc: { $first: '$$ROOT' } } }, // Grab all fields in the most recent version
            { $replaceRoot: { newRoot: '$doc' } }, // Put all fields of the most recent doc back into root of the document
            {
                $project: {
                    _id: 0,
                    title: 1,
                    [mongoField]: 1,
                },
            },
        ])
        .toArray()

    // turn the list of results into a JSON Schema dependencies tree
    const dependencies = {
        [modelName]: {
            oneOf: results
                .filter(result => typeof result.title !== 'undefined') // filter out invalid results
                .map(result => ({
                    properties: {
                        [modelName]: {
                            enum: [result.title],
                        },
                        [targetField]: {
                            enum: result[mongoField],
                        },
                    },
                })),
        },
    }

    return dependencies
}

exports.userRoles = function (dbo) {
    var roleList = []
    return new Promise(function (resolve, reject) {
        dbo.collection('Models')
            .aggregate(
                [
                    {
                        $lookup: {
                            from: 'Workflows',
                            localField: 'workflow',
                            foreignField: 'name',
                            as: 'graph',
                        },
                    },
                    { $project: { _id: 0, name: 1, 'graph.roles': 1 } },
                    { $unwind: '$graph' },
                ],
                { allowDiskUse: true }
            )
            .toArray(function (err, res) {
                if (err) {
                    console.log(err)
                    throw err
                } else {
                    res.forEach(element => {
                        roleList = roleList.concat(element.graph.roles)
                    })
                    resolve(roleList.unique())
                }
            })
    })
}
