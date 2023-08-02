import getDb from '../../lib/mongodb'
import alertsModel from '../../models/__tests__/__fixtures__/models/alerts.json'
import { getSearchDb } from '../db'
import { search } from '../service'
import emergencyAlerts from './__fixtures__/emergencyAlerts.json'

describe('monquery', () => {
    let db: any
    let searchWithMonquery: any

    beforeAll(async () => {
        db = await getSearchDb()
        searchWithMonquery = db.compileQuery
    })

    describe('fields', function () {
        it('should compile', function () {
            var query = searchWithMonquery('model:documents')
            expect(query).toEqual({ model: 'documents' })
        })
    })

    describe('operators', function () {
        it('should compile', function () {
            var query = searchWithMonquery('model:documents OR model:alert')
            expect(query).toEqual({
                $or: [{ model: 'documents' }, { model: 'alert' }],
            })
        })

        it('should compile when nested', function () {
            var query = searchWithMonquery(
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
            var query = searchWithMonquery('model>3')
            expect(query).toEqual({
                model: { $gt: 3 },
            })
        })

        it('should compile greater equal than', function () {
            var query = searchWithMonquery('model >= 5')
            expect(query).toEqual({
                model: { $gte: 5 },
            })
        })

        it('should compile not equal', function () {
            var query = searchWithMonquery('model!=5')
            expect(query).toEqual({
                model: { $ne: 5 },
            })
        })

        it('should compile nested', function () {
            var query = searchWithMonquery(
                '(model > 20 AND model < 50) OR type:alert'
            )
            expect(query).toEqual({
                $or: [
                    { $and: [{ model: { $gt: 20 } }, { model: { $lt: 50 } }] },
                    { type: 'alert' },
                ],
            })
        })
    })
})

describe('search', () => {
    let db: any

    beforeAll(async () => {
        db = await getDb()

        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Alerts').insertMany(emergencyAlerts)
    })

    afterAll(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Alerts').deleteMany({})
    })

    test('returns paginated results', async () => {
        const model = 'Alerts'
        const query = 'severity:emergency'
        const resultsPerPage = 10
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )
        const isAllEmergency = searchResults.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(searchError).toBe(null)
        expect(searchResults.length).toBe(10)
        expect(isAllEmergency).toBe(true)
    })

    test('returns the correct number of paginated results', async () => {
        const model = 'Alerts'
        const query = 'severity:emergency'
        const resultsPerPage = 3
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )
        const isAllEmergency = searchResults.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(searchError).toBe(null)
        expect(searchResults.length).toBe(3)
        expect(isAllEmergency).toBe(true)
    })

    test('paginates results correctly', async () => {
        const model = 'Alerts'
        const query = 'severity:emergency'
        const resultsPerPage = 3
        const pageNumber = 1
        const [firstSearchError, firstSearchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )
        const firstIsAllEmergency = firstSearchResults.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )
        const firstTitles = firstSearchResults.map((result: Record<string, any>) => {
            return result.title
        })

        expect(firstSearchError).toBe(null)
        expect(firstSearchResults.length).toBe(3)
        expect(firstIsAllEmergency).toBe(true)
        expect(firstTitles).toMatchInlineSnapshot(`
            Array [
              "Data search and subsetting services temporarily unavailable",
              "System Maintenance Thursday 05/02/2019",
              "System Maintenance Wednesday 06/17/2020",
            ]
        `)

        const [secondSearchError, secondSearchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber + 1
        )
        const secondIsAllEmergency = secondSearchResults.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )
        const secondTitles = secondSearchResults.map(
            (result: Record<string, any>) => {
                return result.title
            }
        )

        expect(secondSearchError).toBe(null)
        expect(secondSearchResults.length).toBe(3)
        expect(secondIsAllEmergency).toBe(true)
        expect(secondTitles).toMatchInlineSnapshot(`
            Array [
              "System Maintenance Thursday 06/25/2020",
              "MERRA-2 reprocessing for September 2020 data reprocessing ",
              "September 2020 MERRA-2 data are being reprocessed",
            ]
        `)
    })

    test('finds relationships in single properties', async () => {
        const model = 'Alerts'
        const query = 'title: "MERRA-2 September 2020 data reprocessing "'
        const resultsPerPage = 10
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )

        expect(searchError).toBe(null)
        expect(searchResults.length).toBe(1)
    })

    test('finds relationships in array properties', async () => {
        const model = 'Alerts'
        const query = 'severity:emergency AND datasets:FLDAS*'
        const resultsPerPage = 10
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )
        const isAllEmergency = searchResults.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(searchError).toBe(null)
        expect(searchResults.length).toBe(1)
        expect(isAllEmergency).toBe(true)
    })

    test('finds relationships in array properties with grouping', async () => {
        const model = 'Alerts'
        const query = 'severity:emergency AND (datasets:FLDAS* OR datasets:AIRS*)'
        const resultsPerPage = 10
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )
        const isAllEmergency = searchResults.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(searchError).toBe(null)
        expect(searchResults.length).toBe(2)
        expect(isAllEmergency).toBe(true)
    })
})
