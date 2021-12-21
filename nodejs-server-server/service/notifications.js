const { onlyUnique } = require('../utils/array')
const { aggregations } = require('../utils/mongo')
const log = require('log')

// if a state is in this list, no notifications will be sent
const DISABLE_NOTIFICATIONS_FOR_STATES = ['Init', 'Draft']

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
     * @param {*} workflow
     * @param {*} documentState
     * @param {*} currentEdge
     * @returns
     */
    async getUsersToNotifyOfStateChange(
        modelName,
        workflow,
        documentState,
        currentEdge
    ) {
        if (DISABLE_NOTIFICATIONS_FOR_STATES.includes(documentState)) {
            log.debug(
                'Skipping notifications, document is in an initial state: ',
                documentState
            )
            // we only notify when a document moves beyond the initial states
            return []
        }

        if (currentEdge && !currentEdge.notify) {
            // don't notify if current edge has the "notify" property set to false
            log.debug(
                'Skipping notifications, current edge is set to not notify: ',
                currentEdge
            )
            return []
        }

        // get list of workflow edges the document can follow. For example. a document in "Under Review" state
        // can be "Approved" or "Rejecte", so the target edges would be ["Approve", "Reject"]
        const targetEdges = this.getTargetEdges(workflow.edges, documentState)

        log.debug('Target edges ', targetEdges)
        log.debug('Current edge ', currentEdge)

        // get roles that can transition the document into the next state
        const targetRoles = await this.getTargetRoles(
            targetEdges,
            documentState,
            currentEdge
        )

        log.debug('Target roles ', targetRoles)

        // get users that have that role
        const usersWithMatchingRoles = await this.getUsersWithModelRoles(
            modelName,
            targetRoles
        )

        log.debug(
            `There are ${usersWithMatchingRoles.length} users with matching roles: `,
            usersWithMatchingRoles
        )

        // get contact information for users
        const usersToNotify = await this.getContactInformationForUsers(
            usersWithMatchingRoles
        )

        log.debug('Users with contact info', usersToNotify.length)

        return usersToNotify || []
    }

    /**
     * returns a list of users to CC on the email, typically the original author of the document
     * and the user who changed the document state (i.e. a reviewer who has reviewed and "Approved")
     *
     * if ignoreUsers array is included, will remove those users from the list of CCs
     *
     * @param {*} originalAuthorUid
     * @param {*} loggedInUserUid
     * @param {*} ignoreUsers
     */
    async getUsersToCc(originalAuthorUid, loggedInUserUid, ignoreUsers = []) {
        let ccs = [loggedInUserUid, originalAuthorUid]
            // remove any users in the ignore users array (or the users already in the TO: list)
            .filter(uid => !ignoreUsers.find(user => user.uid == uid))

        // fetch and return the users contact info
        return await this.getContactInformationForUsers(ccs)
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
