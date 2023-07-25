import type { Db } from 'mongodb'
import getDb, { makeSafeObjectIDs } from '../lib/mongodb'
import type { Model } from './types'
import searchWithMonquery from './service'

// all the conveniencezzz

exports = module.exports = function (str) {
    return searchWithMonquery(str)
}

// expose methods

exports.compile = searchWithMonquery
