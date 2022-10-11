import { Db } from 'mongodb'
import getDb from '../../lib/mongodb'
import alertsModel from '../../models/__test__/fixtures/models/alerts.json'
import {
    getCommentForDocument,
    getCommentsForDocument,
    createCommentAsUser,
} from '../service'
import mockComments from './__fixtures__/comments.json'
import BaconUser from '../../auth/__test__/__fixtures__/bacon-user.json'

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

    /*
    test('collection return all comments for an existing model and document with comments', async () => {
        const comments = await getCommentsForDocument({
            documentTitle: 'Mock Alert w/ Comments & Troublesome Title',
            modelName: 'Alerts',
        })

        expect(comments).toHaveLength(3)
        expect(comments).toMatchSnapshot()
    })

    test('collection returns no comments for an existing model and document without comments', async () => {
        const comments = await getCommentsForDocument({
            documentTitle: 'Mock Alert without Comments',
            modelName: 'Alerts',
        })

        expect(comments).toHaveLength(0)
        expect(comments).toMatchSnapshot()
    })

    test('singleton returns one comment for an existing model and document with comments', async () => {
        const [error, comments] = await getCommentsForDocument({
            documentTitle: 'Mock Alert w/ Comments & Troublesome Title',
            modelName: 'Alerts',
        })

        const {
            _id: commentId,
            documentId: documentTitle,
            model: modelName,
        } = comments[0]

        const comment = await getCommentForDocument({
            commentId,
            documentTitle,
            modelName,
        })

        expect(comment).toHaveLength(1)
        expect(comment).toMatchSnapshot()
    })

    test('singleton returns no comment for an existing model and document without comments', async () => {
        const comment = await getCommentForDocument({
            commentId: '5c269eaa7f40f1002dfe85f1',
            documentTitle: 'Mock Alert w/ Comments & Troublesome Title',
            modelName: 'Alerts',
        })

        expect(comment).toHaveLength(0)
        expect(comment).toMatchSnapshot()
    })*/

    it('throws an UnauthorizedException if the user is logged out', async () => {
        await expect(async () =>
            createCommentAsUser(
                {
                    model: 'Foo',
                    documentId: 'Bar',
                    text: 'Testing unresolved comment by default',
                },
                {} as any // force logged out
            )
        ).rejects.toThrowErrorMatchingInlineSnapshot(`"Unauthorized"`)
    })

    it('throws a BadRequestException if the comment is invalid', async () => {
        await expect(async () => createCommentAsUser({} as any, BaconUser)).rejects
            .toThrowErrorMatchingInlineSnapshot(`
                    "0: instance requires property \\"documentId\\"
                    1: instance requires property \\"model\\"
                    2: instance requires property \\"text\\"
                    "
                `)
    })

    it('creates an unresolved comment by default', async () => {
        const newComment = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'Testing unresolved comment by default',
            },
            BaconUser
        )

        expect(newComment.resolved).toEqual(false)
    })

    it('creates a new comment as a root comment by default', async () => {
        const newComment = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'Testing unresolved comment by default',
            },
            BaconUser
        )

        expect(newComment.parentId).toEqual('root')
    })

    it('creates a comment on a document', async () => {
        const { _id, createdOn, ...newComment } = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'Test comment',
                parentId: 'foo',
            },
            BaconUser
        )

        expect(newComment).toMatchInlineSnapshot(`
            Object {
              "createdBy": "Bacon User",
              "documentId": "Bar",
              "model": "Foo",
              "parentId": "foo",
              "resolved": false,
              "text": "Test comment",
              "userUid": "bacon",
            }
        `)
    })
})
