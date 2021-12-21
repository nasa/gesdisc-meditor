const { MongoClient } = require('mongodb')
const { NotificationsService } = require('./notifications')
const modifyReviewPublishWorkflow = require('./__test__/modify-review-publish.workflow.json')
const editPublishWorkflow = require('./__test__/edit-publish.workflow.json')

describe('NotificationsService', () => {
    let notifications
    let connection
    let db

    beforeAll(async () => {
        // connect to the mock Jest mongo client
        connection = await MongoClient.connect(global.__MONGO_URI__, {
            useNewUrlParser: true,
        })

        db = await connection.db(global.__MONGO_DB_NAME__)

        // setup the notifications service
        notifications = new NotificationsService(db)

        // small helper function to add users to the mock database
        const addUser = async (id, name, roles) => {
            // insert mEditor user
            await db.collection('Users').insertOne({ id, name, roles })

            // insert Earthdata record
            await db.collection('users-urs').insertOne({
                uid: id,
                firstName: name,
                lastName: 'User',
                emailAddress: name.toLowerCase() + '@mock.nasa.gov',
            })
        }

        // add some fake users to test with
        addUser('bacon', 'Bacon', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Lunch', role: 'Author' },
        ])
        addUser('eggs', 'Eggs', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Lunch', role: 'Reviewer' },
        ])
        addUser('hashbrowns', 'Hashbrowns', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Breakfast', role: 'Post-Publish Reviewer' },
            { model: 'Lunch', role: 'Reviewer' },
        ])
        addUser('grits', 'Grits', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Breakfast', role: 'Post-Publish Reviewer' },
            { model: 'Lunch', role: 'Publisher' },
        ])
        addUser('gravy', 'Gravy', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Lunch', role: 'Publisher' },
        ])
    })

    afterAll(async () => {
        await connection.close()
    })

    test.each`
        documentState     | workflow                       | expectedRoles
        ${'FakeState'}    | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Init'}         | ${modifyReviewPublishWorkflow} | ${['Author']}
        ${'Under Review'} | ${modifyReviewPublishWorkflow} | ${['Reviewer']}
        ${'Published'}    | ${modifyReviewPublishWorkflow} | ${['Publisher']}
        ${'Published'}    | ${editPublishWorkflow}         | ${['Author']}
    `(
        'getTargetRoles: document state of `$documentState` returns target roles: `$expectedRoles`, for workflow: `$workflow.name`',
        ({ documentState, workflow, expectedRoles }) => {
            expect(
                notifications.getTargetRoles(workflow.edges, documentState)
            ).toEqual(expectedRoles)
        }
    )

    it('getTargetRoles: returns the value of "notifyRoles" in the currentEdge', () => {
        const currentEdge = editPublishWorkflow.edges.find(
            edge =>
                edge.role == 'Author' &&
                edge.source == 'Draft' &&
                edge.target == 'Published'
        )

        expect(
            notifications.getTargetRoles(
                editPublishWorkflow.edges,
                'Published',
                currentEdge
            )
        ).toEqual(['Post-Publish Reviewer'])
    })

    test.each`
        documentState     | workflow                       | expectedEdges
        ${'FakeState'}    | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Init'}         | ${modifyReviewPublishWorkflow} | ${[modifyReviewPublishWorkflow.edges[0].label]}
        ${'Hidden'}       | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Under Review'} | ${modifyReviewPublishWorkflow} | ${['Needs more work', 'Approve publication']}
    `(
        'getTargetEdges: document state of `$documentState` returns target edges: `$expectedEdges`, for workflow: `$workflow.name`',
        ({ documentState, workflow, expectedEdges }) => {
            const targetEdges = notifications.getTargetEdges(
                workflow.edges,
                documentState
            )
            expect(targetEdges.map(edge => edge.label)).toEqual(expectedEdges)
        }
    )

    test.each`
        modelName      | userRoles                              | expectedUsers
        ${'Breakfast'} | ${['Author']}                          | ${['bacon', 'eggs', 'hashbrowns', 'grits', 'gravy']}
        ${'Breakfast'} | ${['Post-Publish Reviewer']}           | ${['hashbrowns', 'grits']}
        ${'Breakfast'} | ${['Author', 'Post-Publish Reviewer']} | ${['bacon', 'eggs', 'hashbrowns', 'grits', 'gravy']}
    `(
        'getUsersWithModelRoles($modelName, $userRoles) returns only users with $userRoles in $modelName',
        async ({ modelName, userRoles, expectedUsers }) => {
            const users = await notifications.getUsersWithModelRoles(
                modelName,
                userRoles
            )
            expect(users.sort()).toEqual(expectedUsers.sort())
        }
    )

    test.each`
        documentState     | workflow                       | expectedNodes
        ${'Init'}         | ${modifyReviewPublishWorkflow} | ${['Draft']}
        ${'Draft'}        | ${modifyReviewPublishWorkflow} | ${['Under Review', 'Deleted']}
        ${'Under Review'} | ${modifyReviewPublishWorkflow} | ${['Draft', 'Approved']}
        ${'Approved'}     | ${modifyReviewPublishWorkflow} | ${['Published', 'Under Review']}
        ${'Published'}    | ${modifyReviewPublishWorkflow} | ${['Hidden']}
        ${'FakeState'}    | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Init'}         | ${editPublishWorkflow}         | ${['Draft']}
        ${'Draft'}        | ${editPublishWorkflow}         | ${['Published', 'Deleted']}
        ${'Published'}    | ${editPublishWorkflow}         | ${['Hidden']}
        ${'FakeState'}    | ${editPublishWorkflow}         | ${[]}
    `(
        'getNodesFromEdges: document state of `$documentState` returns target nodes: `$expectedNodes`, for workflow: `$workflow.name`',
        ({ documentState, workflow, expectedNodes }) => {
            const edges = notifications.getTargetEdges(workflow.edges, documentState)
            expect(notifications.getNodesFromEdges(edges)).toEqual(expectedNodes)
        }
    )

    test.each`
        uids                             | expectedEmails
        ${undefined}                     | ${[]}
        ${[]}                            | ${[]}
        ${['bacon']}                     | ${['bacon@mock.nasa.gov']}
        ${['bacon', 'eggs']}             | ${['bacon@mock.nasa.gov', 'eggs@mock.nasa.gov']}
        ${['bacon', 'eggs', 'fakeuser']} | ${['bacon@mock.nasa.gov', 'eggs@mock.nasa.gov']}
    `(
        'getContactInformationForUsers($uids) returns expected email addresses: $expectedEmails',
        async ({ uids, expectedEmails }) => {
            const users = await notifications.getContactInformationForUsers(uids)
            expect(users.map(user => user.emailAddress).sort()).toEqual(
                expectedEmails.sort()
            )
        }
    )

    test.each`
        documentState     | previousState     | modelName      | workflow                       | expectedUids
        ${'Init'}         | ${''}             | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Draft'}        | ${'Init'}         | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Under Review'} | ${'Draft'}        | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${['eggs', 'hashbrowns']}
        ${'Draft'}        | ${'Under Review'} | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Approved'}     | ${'Under Review'} | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${['grits', 'gravy']}
        ${'Under Review'} | ${'Approved'}     | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${['eggs', 'hashbrowns']}
        ${'Published'}    | ${'Approved'}     | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${['grits', 'gravy']}
        ${'Hidden'}       | ${'Published'}    | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Deleted'}      | ${'Draft'}        | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${[]}
        ${'FakeState'}    | ${'Draft'}        | ${'Lunch'}     | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Init'}         | ${''}             | ${'Breakfast'} | ${editPublishWorkflow}         | ${[]}
        ${'Draft'}        | ${'Init'}         | ${'Breakfast'} | ${editPublishWorkflow}         | ${[]}
        ${'Published'}    | ${'Draft'}        | ${'Breakfast'} | ${editPublishWorkflow}         | ${['grits', 'hashbrowns']}
        ${'Hidden'}       | ${'Published'}    | ${'Breakfast'} | ${editPublishWorkflow}         | ${['grits', 'hashbrowns']}
        ${'Deleted'}      | ${'Draft'}        | ${'Breakfast'} | ${editPublishWorkflow}         | ${[]}
        ${'Deleted'}      | ${'Hidden'}       | ${'Breakfast'} | ${editPublishWorkflow}         | ${[]}
        ${'FakeState'}    | ${'Draft'}        | ${'Breakfast'} | ${editPublishWorkflow}         | ${[]}
    `(
        'getListOfUsersToNotifyOfStateChange for $workflow.name workflow and $documentState state, should return $expectedEmails',
        async ({
            documentState,
            previousState,
            modelName,
            workflow,
            expectedUids,
        }) => {
            const currentEdge = previousState
                ? workflow.edges.find(
                      edge =>
                          edge.source == previousState && edge.target == documentState
                  )
                : undefined

            const users = await notifications.getListOfUsersToNotifyOfStateChange(
                modelName,
                workflow,
                documentState,
                currentEdge
            )

            expect(users.map(user => user.uid).sort()).toEqual(expectedUids.sort())
        }
    )
})
