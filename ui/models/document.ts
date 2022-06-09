import { latestVersionOfDocument } from '../lib/aggregations'
import { getDb } from '../lib/mongodb'
import { BadRequestException } from '../utils/errors'
import { getModel } from './model'
import type { Document } from './types'

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

    // retrieve the documents
    const documents = await db
        .collection(modelName)
        .aggregate(query, { allowDiskUse: true })
        .toArray()

    // user is requesting to filter the results further
    // we'll need to parse the passed in Lucene query into Mongo
    //let query

    /* 
        // if the user is searching the documents, we'll convert their query to the mongo equivalent
        if (luceneQuery) {
            try {
                // add match to Mongo query
                query.push({
                    $match: convertLuceneQueryToMongo(luceneQuery, xmeditorProperties),
                })
            } catch (err) {
                throw new Exceptions.BadRequestException('Improperly formatted filter')
            }
        }

        

        // TODO: add target states
        
        .map(function(doc) {
            var res = {"title": _.get(doc, that.titleProperty)};
            res["x-meditor"] = _.pickBy(doc['x-meditor'], function(value, key) {return xmeditorProperties.indexOf(key) !== -1;});
            if ('state' in res["x-meditor"] && !res["x-meditor"].state) res["x-meditor"].state = 'Unspecified';
            _.merge(res, getExtraDocumentMetadata(that, doc));
            return res
        })
        

        return results
    }
*/

    return documents
}
