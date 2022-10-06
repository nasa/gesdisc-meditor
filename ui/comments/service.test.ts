import getDb from '../lib/mongodb'
import { createCommentAsUser } from './service'
import { Db } from 'mongodb'
import BaconUser from '../auth/__test__/__fixtures__/bacon-user.json'

describe('Comments', () => {
    let db: Db

    beforeAll(async () => {
        db = await getDb()
    })

    afterEach(async () => {
        await db.collection('Comments').deleteMany({})
    })

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
