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
        const isAllEmergency = searchResults.results.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(searchError).toBe(null)
        expect(searchResults.results.length).toBe(10)
        expect(isAllEmergency).toBe(true)
    })

    test('returns pagination metadata', async () => {
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

        expect(searchError).toBe(null)
        expect(searchResults.metadata).toMatchInlineSnapshot(`
            Object {
              "pageCount": 2,
              "pageNumber": 1,
              "query": "severity:emergency",
              "resultsCount": 11,
              "resultsPerPage": 10,
            }
        `)
    })

    test('returns pagination metadata for searches without results or out of bounds', async () => {
        const model = 'Alerts'
        const query = 'title:"Deleted Fixture"'
        const resultsPerPage = 10
        const pageNumber = 2
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )

        expect(searchError).toBe(null)
        expect(searchResults.results.length).toBe(0)
        expect(searchResults.metadata).toMatchInlineSnapshot(`
            Object {
              "pageCount": 1,
              "pageNumber": 2,
              "query": "title:\\"Deleted Fixture\\"",
              "resultsCount": 0,
              "resultsPerPage": 10,
            }
        `)
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
        const isAllEmergency = searchResults.results.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(searchError).toBe(null)
        expect(searchResults.results.length).toBe(3)
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
        const [secondSearchError, secondSearchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber + 1
        )

        expect(firstSearchError).toBe(null)
        expect(secondSearchError).toBe(null)

        expect(firstSearchResults.results.length).toBe(3)
        expect(secondSearchResults.results.length).toBe(3)

        const firstIsAllEmergency = firstSearchResults.results.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )
        const secondIsAllEmergency = secondSearchResults.results.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(firstIsAllEmergency).toBe(true)
        expect(secondIsAllEmergency).toBe(true)

        const firstTitles = firstSearchResults.results.map(
            (result: Record<string, any>) => {
                return result.title
            }
        )
        const secondTitles = secondSearchResults.results.map(
            (result: Record<string, any>) => {
                return result.title
            }
        )
        const titlesIntersect = firstTitles.some((title: string) =>
            secondTitles.includes(title)
        )

        expect(titlesIntersect).toBe(false)
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
        expect(searchResults.results.length).toBe(1)
    })

    test('finds relationships in array properties', async () => {
        const model = 'Alerts'
        const query = 'datasets:FLDAS_NOAH001_G_CA_D_001'
        const resultsPerPage = 10
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )
        const isAllFldas = searchResults.results.every(
            (result: Record<string, any>) =>
                result.datasets.includes('FLDAS_NOAH001_G_CA_D_001')
        )

        expect(searchError).toBe(null)
        expect(searchResults.results.length).toBe(1)
        expect(isAllFldas).toBe(true)
    })

    test('fuzzy-finds relationships in array properties', async () => {
        const model = 'Alerts'
        const query = 'datasets:FLDAS*'
        const resultsPerPage = 10
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )
        const isAllFldas = searchResults.results.every(
            (result: Record<string, any>) =>
                result.datasets.includes('FLDAS_NOAH001_G_CA_D_001')
        )

        expect(searchError).toBe(null)
        expect(searchResults.results.length).toBe(1)
        expect(isAllFldas).toBe(true)
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
        const isAllEmergency = searchResults.results.every(
            (result: Record<string, any>) => result.severity === 'emergency'
        )

        expect(searchError).toBe(null)
        expect(searchResults.results.length).toBe(2)
        expect(isAllEmergency).toBe(true)
    })

    test('does not return soft-deleted results', async () => {
        const model = 'Alerts'
        const query = 'title:"Deleted Fixture"'
        const resultsPerPage = 10
        const pageNumber = 1
        const [searchError, searchResults] = await search(
            model,
            query,
            resultsPerPage,
            pageNumber
        )

        expect(searchError).toBe(null)
        expect(searchResults.results.length).toBe(0)
        expect(searchResults.results).toStrictEqual([])
    })
})
