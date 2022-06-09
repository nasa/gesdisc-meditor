import { latestVersionOfDocument, UNSPECIFIED_STATE_NAME } from '../lib/aggregations'
import { getDb } from '../lib/mongodb'
import { BadRequestException } from '../utils/errors'
import { getModel } from './model'
import type { Document } from './types'
import { convertLuceneQueryToMongo } from '../utils/search'

// TODO: add OPTIONAL pagination (don't break existing scripts)
export async function getDocumentsForModel(
    modelName: string,
    luceneQuery?: string
): Promise<Document[]> {
    if (!modelName) {
        throw new BadRequestException('Model name is required')
    }

    const db = await getDb()
    const model = await getModel(modelName) // need the model to get the related workflow and title property

    // build the initial query
    let query = [].concat(
        [
            // filter out deleted documents
            {
                $match: {
                    'x-meditor.deletedOn': { $exists: false },
                },
            },
        ],
        latestVersionOfDocument(model.titleProperty)
    )

    // if the user is searching the documents, we'll convert their query to the mongo equivalent
    if (luceneQuery) {
        try {
            const filterMatch = convertLuceneQueryToMongo(luceneQuery)

            // add filter to existing query
            query[0].$match = {
                ...query[0].$match,
                ...filterMatch,
            }
        } catch (err) {
            throw new BadRequestException('Improperly formatted filter')
        }
    }

    // retrieve the documents
    const documents = await db
        .collection(modelName)
        .aggregate(query, { allowDiskUse: true })
        .toArray()

    // returns just the titles and basic metadata fields of the documents
    // TODO: after we get pagination we can remove this and just return the full documents
    return documents.map(document => {
        let simplifiedDocument = {
            [model.titleProperty]: document[model.titleProperty],
            title: document[model.titleProperty], // legacy property or for simplicity of scripting
            'x-meditor': document['x-meditor'],
        }

        // make sure we have a state
        if (!simplifiedDocument['x-meditor'].state) {
            simplifiedDocument['x-meditor'].state = UNSPECIFIED_STATE_NAME
        }

        return simplifiedDocument
    })

    // filtering the list, get title, xmeditor properties and state
    /*
        that.sourceToTargetStateMap = that.workflow.edges.reduce(function (collector, e) {
            if (that.modelRoles.indexOf(e.role) !== -1) {
                if (!collector[e.source]) collector[e.source] = []
                collector[e.source].push(e.target)
            }
            return collector
        },
        {})

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
    }*/
}
