const { getTargetEdges } = require("./notifications");
const modifyReviewPublishWorkflow = require("./__test__/modify-review-publish.workflow.json");

describe("getTargetEdges", () => {
  it("returns empty array for invalid state", () => {
    expect(getTargetEdges(modifyReviewPublishWorkflow, "Foo")).toEqual([]);
  });

  it("returns first edge for initial state", () => {
    expect(getTargetEdges(modifyReviewPublishWorkflow, "Init")).toEqual([
      modifyReviewPublishWorkflow.edges[0],
    ]);
  });

  it("returns empty array for final/end state", () => {
    expect(getTargetEdges(modifyReviewPublishWorkflow, "Hidden")).toEqual([]);
  });

  it("returns applicable edges for inner workflow state", () => {
    let targetEdges = getTargetEdges(
      modifyReviewPublishWorkflow,
      "Under Review"
    );

    // just check the labels for equality
    expect(targetEdges.map((edge) => edge.label)).toEqual([
      "Needs more work",
      "Approve publication",
    ]);
  });
});
