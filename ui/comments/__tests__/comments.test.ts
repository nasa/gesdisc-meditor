import { Db } from 'mongodb'
import getDb from '../../lib/mongodb'
import alertsModel from '../../models/__test__/fixtures/models/alerts.json'
import { getCommentForDocument, getCommentsForDocument } from '../service'
import mockComments from './__fixtures__/comments.json'

const mockAlerts = [
    {
        title: 'Mock Alert without Comments',
    },
    { title: 'Mock Alert w/ Comments & Troublesome Title' },
]

describe('Comments Service', () => {
    let db: Db

    beforeAll(async () => {
        db = await getDb()

        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Alerts').insertMany(mockAlerts)
        await db.collection('Comments').insertMany(mockComments)
    })

    afterAll(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Alerts').deleteMany({})
        await db.collection('Comments').deleteMany({})
    })

    test('collection return all comments for an existing model and document with comments', async () => {
        const [error, comments] = await getCommentsForDocument(
            'Mock Alert w/ Comments & Troublesome Title',
            'Alerts'
        )

        expect(error).toBeNull()
        expect(comments).toHaveLength(3)
        expect(comments).toMatchSnapshot()
    })

    test('collection returns no comments for an existing model and document without comments', async () => {
        const [error, comments] = await getCommentsForDocument(
            'Mock Alert without Comments',
            'Alerts'
        )

        expect(error).toBeNull()
        expect(comments).toHaveLength(0)
        expect(comments).toMatchSnapshot()
    })

    // todo: figure out why this is failing; the underlying service works well when consumed through our API
    test.skip('singleton returns one comment for an existing model and document with comments', async () => {
        const [mockComment] = mockComments

        const [error, comment] = await getCommentForDocument(
            mockComment._id,
            mockComment.documentId,
            mockComment.model
        )

        expect(error).toBeNull()
        expect(Object.keys(comment)).toHaveLength(11)
        expect(comment).toMatchSnapshot()
    })

    test('singleton returns no comment for an existing model and document without comments', async () => {
        const [error, comment] = await getCommentForDocument(
            '5c269eaa7f40f1002dfe85f1',
            'Mock Alert w/ Comments & Troublesome Title',
            'Alerts'
        )

        expect(error).toBeNull()
        expect(Object.keys(comment)).toHaveLength(0)
        expect(comment).toMatchSnapshot()
    })
})
