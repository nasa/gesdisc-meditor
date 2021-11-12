const { getTargetEdges, getTargetRoles } = require("./notifications");
const modifyReviewPublishWorkflow = require("./__test__/modify-review-publish.workflow.json");

describe("getTargetRoles", () => {
  it("returns empty array for invalid state", () => {
    expect(getTargetRoles(modifyReviewPublishWorkflow.edges, "Foo")).toEqual(
      []
    );
  });

  it("returns roles that can transition from a state", () => {
    expect(
      getTargetRoles(modifyReviewPublishWorkflow.edges, "Under Review")
    ).toEqual(["Reviewer"]);
  });

  it('returns roles that can transition from "Published" state', () => {
    expect(
      getTargetRoles(modifyReviewPublishWorkflow.edges, "Published")
    ).toEqual(["Publisher"]);
  });

  it('returns roles that can transition from "Init" state', () => {
    expect(getTargetRoles(modifyReviewPublishWorkflow.edges, "Init")).toEqual([
      "Author",
    ]);
  });
});

describe("getTargetEdges", () => {
  it("returns empty array for invalid state", () => {
    expect(getTargetEdges(modifyReviewPublishWorkflow.edges, "Foo")).toEqual(
      []
    );
  });

  it("returns first edge for initial state", () => {
    expect(getTargetEdges(modifyReviewPublishWorkflow.edges, "Init")).toEqual([
      modifyReviewPublishWorkflow.edges[0],
    ]);
  });

  it("returns empty array for final/end state", () => {
    expect(getTargetEdges(modifyReviewPublishWorkflow.edges, "Hidden")).toEqual(
      []
    );
  });

  it("returns applicable edges for inner workflow state", () => {
    let targetEdges = getTargetEdges(
      modifyReviewPublishWorkflow.edges,
      "Under Review"
    );

    // just check the labels for equality
    expect(targetEdges.map((edge) => edge.label)).toEqual([
      "Needs more work",
      "Approve publication",
    ]);
  });
});
