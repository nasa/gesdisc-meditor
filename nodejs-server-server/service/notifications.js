const { onlyUnique } = require("../utils/array");

/**
 * given a list of edges and a state, will return a list of roles that can transition from this state
 *
 * @param {*} edges
 * @param {*} state
 * @returns
 */
function getTargetRoles(edges, state) {
  // roles are based on edges, so get edges that branch from the state
  const targetEdges = getTargetEdges(edges, state);

  // return list of unique roles
  return targetEdges.map((edge) => edge.role).filter(onlyUnique);
}

/**
 * given a list of edges and a state, get a list of edges that the document can move into
 * ex. a document in "Under Review" state could have target edges: ["Approve", "Reject"]
 *
 * @param {*} edges
 * @param {*} state
 */
function getTargetEdges(edges, state) {
  return edges
    .filter((edge) => edge.source === state) // retrieve edges that branch off the current state
    .filter(onlyUnique); // remove duplicates
}

module.exports = {
  getTargetEdges,
  getTargetRoles,
};
