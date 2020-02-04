"use strict";

const test            = require("tape")
    , resolveUncached = require("./_resolve-uncached");

test("getNamespacePrefix: Should not show default namespace", t => {
	const { log, getNamespacePrefix } = resolveUncached(() => {
		require("supports-color").stderr = false;
		require("log/lib/get-default-namespace").set("marko");
	});

	t.equal(getNamespacePrefix(log.get("foo")), log.get("foo").namespace);
	t.equal(getNamespacePrefix(log.get("foo").get("bar")), log.get("foo").get("bar").namespace);
	t.equal(getNamespacePrefix(log.get("marko")), null);
	t.equal(getNamespacePrefix(log.get("marko:bar")), ":bar");
	t.end();
});
