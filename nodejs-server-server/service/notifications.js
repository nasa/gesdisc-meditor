const { onlyUnique } = require("../utils/array");

/**
 * given a workflow and a state, get a list of edges that the document can move into
 * ex. a document in "Under Review" state could have target edges: ["Approve", "Reject"]
 *
 * @param {*} workflow
 * @param {*} currentState
 */
module.exports.getTargetEdges = function (workflow, currentState) {
  return workflow.edges
    .filter((edge) => edge.source === currentState) // retrieve edges that branch off the current state
    .filter(onlyUnique); // remove duplicates
};
