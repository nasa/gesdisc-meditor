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
        await addUser('bacon', 'Bacon', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Lunch', role: 'Author' },
        ])
        await addUser('eggs', 'Eggs', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Lunch', role: 'Reviewer' },
        ])
        await addUser('hashbrowns', 'Hashbrowns', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Breakfast', role: 'Post-Publish Reviewer' },
            { model: 'Lunch', role: 'Reviewer' },
        ])
        await addUser('grits', 'Grits', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Breakfast', role: 'Post-Publish Reviewer' },
            { model: 'Lunch', role: 'Publisher' },
        ])
        await addUser('gravy', 'Gravy', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Lunch', role: 'Publisher' },
        ])
    })

    afterAll(async () => {
        await connection.close()
    })

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
        'getUsersToNotifyOfStateChange for $workflow.name workflow and $documentState state, should return $expectedEmails',
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

            const users = await notifications.getUsersToNotifyOfStateChange(
                modelName,
                workflow,
                documentState,
                currentEdge
            )

            expect(users.map(user => user.uid).sort()).toEqual(expectedUids.sort())
        }
    )

    test.each`
        author     | user         | toUsers     | expectedCcs
        ${'bacon'} | ${'eggs'}    | ${[]}       | ${['bacon', 'eggs']}
        ${'bacon'} | ${'eggs'}    | ${['eggs']} | ${['bacon']}
        ${'bacon'} | ${undefined} | ${['eggs']} | ${['bacon']}
    `(
        'getUsersToCc($author, $user, $toUsers) should return CCs of $expectedCcs',
        async ({ author, user, toUsers, expectedCcs }) => {
            const ccUsers = await notifications.getUsersToCc(
                author,
                user,
                toUsers.map(user => ({ uid: user })) // turn it back into a "user" object
            )

            expect(ccUsers.map(user => user.uid).sort()).toEqual(expectedCcs.sort())
        }
    )

    test.each`
        firstName    | lastName     | emailAddress                | expectedEmail
        ${'John'}    | ${'Snow'}    | ${'johnsnow@mock.nasa.gov'} | ${'"John Snow" <johnsnow@mock.nasa.gov>'}
        ${undefined} | ${'Snow'}    | ${'johnsnow@mock.nasa.gov'} | ${'" Snow" <johnsnow@mock.nasa.gov>'}
        ${'John'}    | ${undefined} | ${'johnsnow@mock.nasa.gov'} | ${'"John " <johnsnow@mock.nasa.gov>'}
        ${'John'}    | ${'Snow'}    | ${undefined}                | ${''}
    `(
        'formatUserForEmail should return $expectedEmail for $firstName, $lastName, $emailAddress',
        async ({ firstName, lastName, emailAddress, expectedEmail }) => {
            expect(
                notifications.formatUserForEmail({
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(emailAddress && { emailAddress }),
                })
            ).toEqual(expectedEmail)
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
})
