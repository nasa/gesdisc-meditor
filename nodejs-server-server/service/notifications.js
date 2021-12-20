const { onlyUnique } = require('../utils/array')
const { aggregations } = require('../utils/mongo')
const { HttpNotFoundException } = require('./errors')

class NotificationsService {
    constructor(db) {
        this.db = db
    }

    /**
     * returns a list of users to notify when a document enters the specified "documentState"
     *
     * we have to dynamically figure out which users to notify of a state change based on where the document
     * is in it's assigned workflow
     *
     * For example: a document in "Under Review" state can move into "Approved" or "Draft" states
     * only the "Reviewer" role can transition into those states (based on the workflow)
     * so we look for users that have the "Reviewer" role for a given model
     *
     * @param {*} modelName
     * @param {*} workflowEdges
     * @param {*} documentState
     * @param {*} currentEdge
     * @returns
     */
    async getListOfUsersToNotifyOfStateChange(
        modelName,
        workflow,
        documentState,
        currentEdge
    ) {
        // get list of workflow edges the document can follow. For example. a document in "Under Review" state
        // can be "Approved" or "Rejecte", so the target edges would be ["Approve", "Reject"]
        const targetEdges = this.getTargetEdges(workflow.edges, documentState)

        // get roles that can transition the document into the next state
        const targetRoles = await this.getTargetRoles(
            targetEdges,
            documentState,
            currentEdge
        )

        // get users that have that role
        const usersWithMatchingRoles = await this.getUsersWithModelRoles(
            modelName,
            targetRoles
        )

        // get contact information for users
        const usersToNotify = await this.getContactInformationForUsers(
            usersWithMatchingRoles
        )

        if (!usersToNotify || usersToNotify.length <= 0) {
            // no matching users found
            throw new HttpNotFoundException(
                'Could not find users to notify of the status change'
            )
        }

        return usersToNotify
    }

    /**
     * finds all users that have the requested roles for the given model
     * ex. "give me all News reviewers" = getUsersWithModelRole('News', ['Reviewer'])
     * @param {*} model
     * @param {*} roles
     * @returns
     */
    async getUsersWithModelRoles(model, roles) {
        if (!roles.length) {
            return []
        }

        const results = await this.db
            .collection('Users')
            .aggregate(
                [].concat(aggregations.latestVersionOfDocument, [
                    { $unwind: '$roles' },
                    {
                        $match: {
                            'roles.model': model,
                            'roles.role': { $in: roles },
                        },
                    },
                    { $group: { _id: null, ids: { $addToSet: '$id' } } },
                ]),
                { allowDiskUse: true }
            )
            .toArray()

        if (!results.length) {
            return []
        }

        // return only the user ids from the response
        return results[0].ids
    }

    /**
     * given a list of user ids, fetches their contact information from the database
     * contact info includes: emailAddress, firstName, lastName, and uid
     * @param {*} users
     */
    async getContactInformationForUsers(users) {
        if (!users || !users.length) {
            return []
        }

        return await this.db
            .collection('users-urs')
            .find({ uid: { $in: users } })
            .project({
                _id: 0,
                emailAddress: 1,
                firstName: 1,
                lastName: 1,
                uid: 1,
            })
            .toArray()
    }

    /**
     * given a list of edges and a state, will return a list of roles that can transition from this state
     *
     * if the currentEdge has a notifyRoles property set, we'll use that specified role instead
     *
     * @param {*} edges
     * @param {*} state
     * @param {*} currentEdge
     * @returns
     */
    getTargetRoles(edges, state, currentEdge) {
        if (currentEdge && 'notifyRoles' in currentEdge) {
            // the current edge has specific roles set, return those instead of trying to figure it out dynamically
            return typeof currentEdge.notifyRoles === 'string'
                ? currentEdge.notifyRoles.split(',')
                : currentEdge.notifyRoles
        }

        // roles are based on edges, so get edges that branch from the state
        const targetEdges = this.getTargetEdges(edges, state)

        // return list of unique roles
        return targetEdges.map(edge => edge.role).filter(onlyUnique)
    }

    /**
     * retrieves a list of target nodes a document can move into, given a list of target edges
     * @param {*} edges
     * @returns
     */
    getNodesFromEdges(edges) {
        return edges.map(edge => edge.target).filter(onlyUnique)
    }

    /**
     * given a list of edges and a state, get a list of edges that the document can move into
     * ex. a document in "Under Review" state could have target edges: ["Approve", "Reject"]
     *
     * @param {*} edges
     * @param {*} state
     */
    getTargetEdges(edges, state) {
        return edges
            .filter(edge => edge.source === state) // retrieve edges that branch off the current state
            .filter(onlyUnique) // remove duplicates
    }
}

module.exports = {
    NotificationsService,
}
