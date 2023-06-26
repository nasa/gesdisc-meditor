import type { Db } from 'mongodb'
import { getUsersDb } from '../../auth/db'
import baconUser from '../../auth/__tests__/__fixtures__/bacon-user.json'
import { getDocument } from '../../documents/service'
import alertWithPublication from '../../documents/__tests__/__fixtures__/alertWithPublication.json'
import getDb from '../../lib/mongodb'
import { getModelWithWorkflow } from '../../models/service'
import type { ModelWithWorkflow } from '../../models/types'
import howDoIFAQ from '../../models/__tests__/__fixtures__/faqs/how-do-i.json'
import alertsModel from '../../models/__tests__/__fixtures__/models/alerts.json'
import faqsModel from '../../models/__tests__/__fixtures__/models/faqs.json'
import {
    getNodesFromEdges,
    getWorkflowEdgeMatchingSourceAndTarget,
} from '../../workflows/service'
import editPublishWorkflow from '../../workflows/__tests__/__fixtures__/edit-publish.json'
import modifyReviewPublishWorkflow from '../../workflows/__tests__/__fixtures__/modify-review-publish.json'
import {
    constructEmailMessageForStateChange,
    formatUserForEmail,
    getUsersToCc,
    getUsersToNotifyOfStateChange,
    populateEmailMessageTemplate,
    shouldNotifyUsersOfStateChange,
} from '../service'

describe('Email Notifications', () => {
    let db: Db

    beforeAll(async () => {
        db = await getDb()

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
            { model: 'Alerts', role: 'Author' },
            { model: 'FAQs', role: 'Author' },
        ])
        await addUser('eggs', 'Eggs', [
            { model: 'Alerts', role: 'Author' },
            { model: 'FAQs', role: 'Reviewer' },
        ])
        await addUser('hashbrowns', 'Hashbrowns', [
            { model: 'Alerts', role: 'Author' },
            { model: 'Alerts', role: 'Post-Publish Reviewer' },
            { model: 'FAQs', role: 'Reviewer' },
        ])
        await addUser('grits', 'Grits', [
            { model: 'Alerts', role: 'Author' },
            { model: 'Alerts', role: 'Post-Publish Reviewer' },
            { model: 'FAQs', role: 'Publisher' },
        ])
        await addUser('gravy', 'Gravy', [
            { model: 'Alerts', role: 'Author' },
            { model: 'FAQs', role: 'Publisher' },
        ])

        await db.collection('Models').insertOne(faqsModel)
        await db.collection('Models').insertOne(alertsModel)
        await db.collection('Workflows').insertOne(modifyReviewPublishWorkflow)
        await db.collection('Workflows').insertOne(editPublishWorkflow)
        await db.collection('Alerts').insertOne(alertWithPublication)
        await db.collection('FAQs').insertOne(howDoIFAQ)
    })

    afterAll(async () => {
        await db.collection('Users').deleteMany({})
        await db.collection('Models').deleteMany({})
        await db.collection('Workflows').deleteMany({})
        await db.collection('Alerts').deleteMany({})
        await db.collection('FAQs').deleteMany({})
    })

    describe('shouldNotifyUsersOfStateChange', () => {
        test.each`
            modelName | documentSourceState | documentState     | result
            ${'FAQs'} | ${'Init'}           | ${'Init'}         | ${false}
            ${'FAQs'} | ${'Init'}           | ${'Draft'}        | ${false}
            ${'FAQs'} | ${'Draft'}          | ${'Under Review'} | ${true}
            ${'FAQs'} | ${'Under Review'}   | ${'Draft'}        | ${true}
            ${'FAQs'} | ${'Under Review'}   | ${'Approved'}     | ${true}
            ${'FAQs'} | ${'Approved'}       | ${'Published'}    | ${true}
            ${'FAQs'} | ${'Approved'}       | ${'Under Review'} | ${true}
            ${'FAQs'} | ${'Published'}      | ${'Hidden'}       | ${false}
            ${'FAQs'} | ${'Hidden'}         | ${'Published'}    | ${false}
            ${'FAQs'} | ${'Draft'}          | ${'Deleted'}      | ${false}
            ${'FAQs'} | ${'Hidden'}         | ${'Deleted'}      | ${false}
            ${'FAQs'} | ${'Published'}      | ${'Deleted'}      | ${false}
        `(
            'should return `$result` for a document state of `$documentState` (source state of `$documentSourceState`) in model `$modelName`',
            async ({
                modelName,
                documentSourceState,
                documentState,
                result,
            }: {
                modelName: string
                documentSourceState: string
                documentState: string
                result: boolean
            }) => {
                const [error, model] = await getModelWithWorkflow(modelName)
                const currentEdge = model.workflow.edges.find(
                    edge =>
                        edge.source === documentSourceState &&
                        edge.target === documentState
                )

                expect(error).toBeNull()
                expect(
                    shouldNotifyUsersOfStateChange(documentState, currentEdge)
                ).toEqual(result)
            }
        )
    })

    test.each`
        documentState     | previousState     | modelName   | workflow                       | expectedUids
        ${'Init'}         | ${''}             | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Draft'}        | ${'Init'}         | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Under Review'} | ${'Draft'}        | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${['eggs', 'hashbrowns']}
        ${'Draft'}        | ${'Under Review'} | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${['eggs', 'hashbrowns']}
        ${'Approved'}     | ${'Under Review'} | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${['grits', 'gravy']}
        ${'Under Review'} | ${'Approved'}     | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${['eggs', 'hashbrowns']}
        ${'Published'}    | ${'Approved'}     | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${['grits', 'gravy']}
        ${'Hidden'}       | ${'Published'}    | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Deleted'}      | ${'Draft'}        | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${[]}
        ${'FakeState'}    | ${'Draft'}        | ${'FAQs'}   | ${modifyReviewPublishWorkflow} | ${[]}
        ${'Init'}         | ${''}             | ${'Alerts'} | ${editPublishWorkflow}         | ${[]}
        ${'Draft'}        | ${'Init'}         | ${'Alerts'} | ${editPublishWorkflow}         | ${[]}
        ${'Published'}    | ${'Draft'}        | ${'Alerts'} | ${editPublishWorkflow}         | ${['grits', 'hashbrowns']}
        ${'Hidden'}       | ${'Published'}    | ${'Alerts'} | ${editPublishWorkflow}         | ${['grits', 'hashbrowns']}
        ${'Deleted'}      | ${'Draft'}        | ${'Alerts'} | ${editPublishWorkflow}         | ${[]}
        ${'Deleted'}      | ${'Hidden'}       | ${'Alerts'} | ${editPublishWorkflow}         | ${[]}
        ${'FakeState'}    | ${'Draft'}        | ${'Alerts'} | ${editPublishWorkflow}         | ${[]}
    `(
        'getUsersToNotifyOfStateChange for $workflow.name workflow, $modelName model, and $documentState state (source $previousState), should return $expectedUids',
        async ({
            documentState,
            previousState,
            modelName,
            workflow,
            expectedUids,
        }) => {
            const [_error, model] = await getModelWithWorkflow(modelName)
            const currentEdge = previousState
                ? workflow.edges.find(
                      edge =>
                          edge.source == previousState && edge.target == documentState
                  )
                : undefined

            const users = await getUsersToNotifyOfStateChange(
                model,
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
            const ccUsers = await getUsersToCc(
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
                formatUserForEmail({
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
            const usersDb = await getUsersDb()
            const users = await usersDb.getContactInformationForUsers(uids)
            expect(users.map(user => user.emailAddress).sort()).toEqual(
                expectedEmails.sort()
            )
        }
    )

    describe('populateEmailMessageTemplate', () => {
        let model
        let targetNodes
        let currentEdge

        const defaultEmailTemplate =
            `An {{modelName}} document drafted by {{authorName}} has been marked by {{role}} {{userFirstName}} {{userLastName}} as '{{label}}' and is now in a '{{target}}' state.\n\n` +
            `An action is required to transition the document to one of the [{{targets}}] states. {{modelNotificationTemplate}}`

        beforeAll(async () => {
            const [_error, modelWithWorkflow] = await getModelWithWorkflow(
                faqsModel.name,
                'Under Review'
            )

            model = modelWithWorkflow
            targetNodes = getNodesFromEdges(model.workflow.currentEdges)
            currentEdge = getWorkflowEdgeMatchingSourceAndTarget(
                model.workflow,
                'Draft',
                'Under Review'
            )
        })

        it('should return a default email message if no custom email message is setup in the workflow', async () => {
            const emailMessage = await populateEmailMessageTemplate(
                model,
                {},
                targetNodes,
                currentEdge,
                'hashbrowns',
                baconUser,
                defaultEmailTemplate
            )

            expect(emailMessage).toMatchInlineSnapshot(`
                "An FAQs document drafted by Hashbrowns User has been marked by Author Bacon User as 'Submit for review' and is now in a 'Under Review' state.

                An action is required to transition the document to one of the [Draft, Approved] states. <p><strong>Latest Comment:</strong></p>"
            `)
        })

        it('should support a model without a notification template', async () => {
            const { notificationTemplate, ...modelWithNoTemplate } = model

            const emailMessage = await populateEmailMessageTemplate(
                modelWithNoTemplate,
                {},
                targetNodes,
                currentEdge,
                'hashbrowns',
                baconUser,
                defaultEmailTemplate
            )

            expect(emailMessage).toMatchInlineSnapshot(`
                "An FAQs document drafted by Hashbrowns User has been marked by Author Bacon User as 'Submit for review' and is now in a 'Under Review' state.

                An action is required to transition the document to one of the [Draft, Approved] states. "
            `)
        })

        it('should use the workflows configured email message instead of the default message', async () => {
            // a custom email message utilizing all of the passed in params
            const emailMessage = [
                'Model name: {{modelName}}',
                'Author name: {{ authorName }}',
                'Author UID: {{ author }}',
                'Role: {{ role }}',
                'Label: {{ label }}',
                'User First Name: {{ userFirstName }}',
                'User Last Name: {{ userLastName }}',
                'Targets: {{ targets }}',
                'Target: {{ target }}',
                'Model Notification Template: {{ modelNotificationTemplate }}',
            ].join(', ')

            // add the custom email message to the "Under Review node"
            const nodes = model.workflow.nodes.map(node => {
                return node.id === 'Under Review'
                    ? {
                          ...node,
                          emailMessage,
                      }
                    : node
            })

            // and add the nodes to the test workflowo
            const modelWithCustomEmailTemplate: ModelWithWorkflow = {
                ...model,
                workflow: {
                    ...model.workflow,
                    nodes,
                },
            }

            const emailTemplate = await populateEmailMessageTemplate(
                modelWithCustomEmailTemplate,
                {},
                targetNodes,
                currentEdge,
                'hashbrowns',
                baconUser,
                defaultEmailTemplate
            )

            expect(emailTemplate).toMatchInlineSnapshot(
                `"Model name: FAQs, Author name: Hashbrowns User, Author UID: hashbrowns, Role: Author, Label: Submit for review, User First Name: Bacon, User Last Name: User, Targets: Draft, Approved, Target: Under Review, Model Notification Template: <p><strong>Latest Comment:</strong></p>"`
            )
        })
    })

    describe('constructEmailMessageForStateChange', () => {
        let mockDate = new Date(2022, 0, 1, 0, 0, 0, 0)
        let dateSpy
        let model
        let currentEdge

        beforeAll(async () => {
            const [_error, modelWithWorkflow] = await getModelWithWorkflow(
                faqsModel.name,
                'Under Review'
            )

            model = modelWithWorkflow
            currentEdge = getWorkflowEdgeMatchingSourceAndTarget(
                model.workflow,
                'Draft',
                'Under Review'
            )
        })

        beforeEach(() => {
            dateSpy = jest
                .spyOn(global, 'Date')
                .mockImplementation(() => mockDate as unknown as string)
        })

        afterEach(() => {
            dateSpy.mockRestore()
        })

        it('should return a default email message if no custom email message is setup in the workflow', async () => {
            const [_error, faq] = await getDocument(
                howDoIFAQ.title,
                'FAQs',
                baconUser
            )
            const emailMessage = await constructEmailMessageForStateChange(
                model,
                faq,
                'Under Review',
                currentEdge,
                baconUser
            )

            expect(emailMessage).toMatchSnapshot()
        })
    })
})
