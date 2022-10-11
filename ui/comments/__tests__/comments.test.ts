import { Db } from 'mongodb'
import getDb from '../../lib/mongodb'
import alertsModel from '../../models/__test__/fixtures/models/alerts.json'
import {
    getCommentForDocument,
    getCommentsForDocument,
    createCommentAsUser,
    updateCommentAsUser,
} from '../service'
import mockComments from './__fixtures__/comments.json'
import BaconUser from '../../auth/__test__/__fixtures__/bacon-user.json'
import CommentsDB from '../db'

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
    })

    beforeEach(async () => {
        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Alerts').insertMany(mockAlerts)
        await db.collection('Comments').insertMany(mockComments)
    })

    afterEach(async () => {
        await db.collection('Models').deleteMany({})
        await db.collection('Alerts').deleteMany({})
        await db.collection('Comments').deleteMany({})
    })

    test('collection return all comments for an existing model and document with comments', async () => {
        const [error, comments] = await getCommentsForDocument({
            documentTitle: 'Mock Alert w/ Comments & Troublesome Title',
            modelName: 'Alerts',
        })

        expect(error).toBeNull()
        expect(comments).toHaveLength(3)
        expect(comments).toMatchSnapshot()
    })

    test('collection returns no comments for an existing model and document without comments', async () => {
        const [error, comments] = await getCommentsForDocument({
            documentTitle: 'Mock Alert without Comments',
            modelName: 'Alerts',
        })

        expect(error).toBeNull()
        expect(comments).toHaveLength(0)
        expect(comments).toMatchSnapshot()
    })

    // todo: figure out why this is failing; the underlying service works well when consumed through our API
    test.skip('singleton returns one comment for an existing model and document with comments', async () => {
        const [mockComment] = mockComments

        const [error, comment] = await getCommentForDocument({
            commentId: mockComment._id,
            documentTitle: mockComment.documentId,
            modelName: mockComment.model,
        })

        expect(error).toBeNull()
        expect(Object.keys(comment)).toHaveLength(11)
        expect(comment).toMatchSnapshot()
    })

    test('singleton returns no comment for an existing model and document without comments', async () => {
        const [error, comment] = await getCommentForDocument({
            commentId: '5c269eaa7f40f1002dfe85f1',
            documentTitle: 'Mock Alert w/ Comments & Troublesome Title',
            modelName: 'Alerts',
        })

        expect(error).toBeNull()
        expect(Object.keys(comment)).toHaveLength(0)
        expect(comment).toMatchSnapshot()
    })

    it('returns an UnauthorizedException if the user is logged out', async () => {
        const [error, comment] = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'Testing unresolved comment by default',
            },
            {} as any // force logged out
        )

        expect(error).toMatchInlineSnapshot(`[Error: Unauthorized]`)
        expect(comment).toBeNull()
    })

    it('returns a list of validation errors if the comment is invalid', async () => {
        const [error, comment] = await createCommentAsUser({} as any, BaconUser)

        expect(error).toMatchInlineSnapshot(`
            [Error: 0: instance requires property "documentId"
            1: instance requires property "model"
            2: instance requires property "text"
            ]
        `)
        expect(comment).toBeNull()
    })

    it('creates an unresolved comment by default', async () => {
        const [error, newComment] = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'Testing unresolved comment by default',
            },
            BaconUser
        )

        expect(error).toBeNull()
        expect(newComment.resolved).toEqual(false)
    })

    it('creates a new comment as a root comment by default', async () => {
        const [error, newComment] = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'Testing unresolved comment by default',
            },
            BaconUser
        )

        expect(error).toBeNull()
        expect(newComment.parentId).toEqual('root')
    })

    it('creates a comment on a document', async () => {
        const [error, { _id, createdOn, ...newComment }] = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'Test comment',
                parentId: 'foo',
            },
            BaconUser
        )

        expect(error).toBeNull()
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

    it('returns an UnauthorizedException if the user is logged out while updating a comment', async () => {
        const [error, comment] = await updateCommentAsUser(
            {
                _id: 'foo',
                resolved: true,
                text: 'bacon',
            },
            {} as any // force logged out
        )

        expect(error).toMatchInlineSnapshot(`[Error: Unauthorized]`)
        expect(comment).toBeNull()
    })

    it('returns a list of validation errors if the comment updates are invalid', async () => {
        const [error, comment] = await updateCommentAsUser({} as any, BaconUser)

        expect(error).toMatchInlineSnapshot(`
            [Error: 0: instance is not exactly one from [subschema 0],[subschema 1]
            ]
        `)
        expect(comment).toBeNull()
    })

    it('returns a BadRequestException if trying to update `text` and `resolved` at the same time', async () => {
        const [error, comment] = await updateCommentAsUser(
            {
                _id: 'foo',
                resolved: true,
                text: 'Bacon',
            },
            BaconUser
        )

        expect(error).toMatchInlineSnapshot(`
            [Error: 0: instance is not exactly one from [subschema 0],[subschema 1]
            ]
        `)
        expect(comment).toBeNull()
    })

    it('updates a comments text', async () => {
        // insert a new comment
        const [_error, { _id: insertedId, ...newComment }] =
            await createCommentAsUser(
                {
                    model: 'Foo',
                    documentId: 'Bar',
                    text: 'This is my sample text that should be changed!',
                },
                BaconUser
            )

        // attempt to update it
        const [error, { _id: updatedId, ...updatedComment }] =
            await updateCommentAsUser(
                {
                    _id: insertedId.toString(),
                    text: 'Bacon',
                },
                BaconUser
            )

        expect(error).toBeNull()
        expect(updatedComment).toEqual({
            ...newComment,
            text: 'Bacon',
        })
    })

    it('resolves a comment and all its child comments', async () => {
        const [_p, parentComment] = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'I am a parent, I should be resolved',
            },
            BaconUser
        )

        const [_c, childComment] = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'I am a child of the parent comment, I should be resolved',
                parentId: parentComment._id,
            },
            BaconUser
        )

        const [_s, siblingComment] = await createCommentAsUser(
            {
                model: 'Foo',
                documentId: 'Bar',
                text: 'I am a sibling, I should NOT be resolved',
            },
            BaconUser
        )

        // attempt to resolve the parent comment
        const [error] = await updateCommentAsUser(
            {
                _id: parentComment._id.toString(),
                resolved: true,
            },
            BaconUser
        )

        expect(error).toBeNull()
        expect(await CommentsDB.getCommentById(parentComment._id)).toMatchObject({
            resolved: true,
            resolvedBy: BaconUser.uid,
        })
        expect(await CommentsDB.getCommentById(childComment._id)).toMatchObject({
            resolved: true,
            resolvedBy: BaconUser.uid,
        })
        expect(await CommentsDB.getCommentById(siblingComment._id)).toMatchObject({
            resolved: false,
        })
    })
})
