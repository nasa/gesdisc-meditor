import getDb from '../../lib/mongodb'
import type { Db } from 'mongodb'
import { searchwithMonquery } from '../service'

describe('fields', function () {
    it('should compile', function () {
        var query = searchwithMonquery('model:documents')
        expect(query).toEqual({ model: 'documents' })
    })
})

describe('operators', function () {
    it('should compile', function () {
        var query = searchwithMonquery('model:documents OR model:alert')
        expect(query).toEqual({
            $or: [{ model: 'documents' }, { model: 'alert' }],
        })
    })

    it('should compile when nested', function () {
        var query = searchwithMonquery(
            '(model:documents AND type:upload) OR model:alert'
        )
        expect(query).toEqual({
            $or: [
                { $and: [{ model: 'documents' }, { type: 'upload' }] },
                { model: 'alert' },
            ],
        })
    })
})

describe('comparison', function () {
    it('should compile greater than', function () {
        var query = searchwithMonquery('model>3')
        expect(query).toEqual({
            model: { $gt: 3 },
        })
    })

    it('should compile greater equal than', function () {
        var query = searchwithMonquery('model >= 5')
        expect(query).toEqual({
            model: { $gte: 5 },
        })
    })

    it('should compile not equal', function () {
        var query = searchwithMonquery('model!=5')
        expect(query).toEqual({
            model: { $ne: 5 },
        })
    })

    it('should compile nested', function () {
        var query = searchwithMonquery('(model > 20 AND model < 50) OR type:alert')
        expect(query).toEqual({
            $or: [
                { $and: [{ model: { $gt: 20 } }, { model: { $lt: 50 } }] },
                { type: 'alert' },
            ],
        })
    })
})
