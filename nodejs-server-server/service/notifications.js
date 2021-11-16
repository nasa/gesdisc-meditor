const { onlyUnique } = require('../utils/array')
const { aggregations } = require('../utils/mongo')

class NotificationsService {
    constructor(db) {
        this.db = db
    }

    /**
     * finds all users that have the requested roles for the given model
     * ex. "give me all News reviewers" = getUsersWithModelRole('News', ['Reviewer'])
     * @param {*} model
     * @param {*} roles
     * @returns
     */
    async getUsersWithModelRoles(model, roles) {
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

        // return only the user ids from the response
        return results[0].ids
    }

    /**
     * given a list of edges and a state, will return a list of roles that can transition from this state
     *
     * @param {*} edges
     * @param {*} state
     * @returns
     */
    getTargetRoles(edges, state) {
        // roles are based on edges, so get edges that branch from the state
        const targetEdges = this.getTargetEdges(edges, state)

        // return list of unique roles
        return targetEdges.map(edge => edge.role).filter(onlyUnique)
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
