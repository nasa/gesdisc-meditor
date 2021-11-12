const { NotificationsService } = require('./notifications')
const modifyReviewPublishWorkflow = require('./__test__/modify-review-publish.workflow.json')

describe('NotificationsService', () => {
    let notifications = new NotificationsService()

    it('getTargetRoles() returns empty array for invalid state', () => {
        expect(
            notifications.getTargetRoles(modifyReviewPublishWorkflow.edges, 'Foo')
        ).toEqual([])
    })

    it('getTargetRoles() returns roles that can transition from a state', () => {
        expect(
            notifications.getTargetRoles(
                modifyReviewPublishWorkflow.edges,
                'Under Review'
            )
        ).toEqual(['Reviewer'])
    })

    it('getTargetRoles() returns roles that can transition from "Published" state', () => {
        expect(
            notifications.getTargetRoles(
                modifyReviewPublishWorkflow.edges,
                'Published'
            )
        ).toEqual(['Publisher'])
    })

    it('getTargetRoles() returns roles that can transition from "Init" state', () => {
        expect(
            notifications.getTargetRoles(modifyReviewPublishWorkflow.edges, 'Init')
        ).toEqual(['Author'])
    })

    it('getTargetEdges() returns empty array for invalid state', () => {
        expect(
            notifications.getTargetEdges(modifyReviewPublishWorkflow.edges, 'Foo')
        ).toEqual([])
    })

    it('getTargetEdges() returns first edge for initial state', () => {
        expect(
            notifications.getTargetEdges(modifyReviewPublishWorkflow.edges, 'Init')
        ).toEqual([modifyReviewPublishWorkflow.edges[0]])
    })

    it('getTargetEdges() returns empty array for final/end state', () => {
        expect(
            notifications.getTargetEdges(modifyReviewPublishWorkflow.edges, 'Hidden')
        ).toEqual([])
    })

    it('getTargetEdges() returns applicable edges for inner workflow state', () => {
        let targetEdges = notifications.getTargetEdges(
            modifyReviewPublishWorkflow.edges,
            'Under Review'
        )

        // just check the labels for equality
        expect(targetEdges.map(edge => edge.label)).toEqual([
            'Needs more work',
            'Approve publication',
        ])
    })
})
