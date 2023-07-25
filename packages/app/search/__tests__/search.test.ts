import getDb from '../../lib/mongodb'
import { searchWithMonquery } from '../service'

//var query = require('..');
var assert = require('assert')
var compile = require('monquery')

describe('fields', function () {
    it('should compile', function () {
        var ret = compile('level:error')
        expect(ret).toEqual({ level: 'error' })
    })
})
