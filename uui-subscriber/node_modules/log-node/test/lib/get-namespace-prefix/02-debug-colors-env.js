"use strict";

const test            = require("tape")
    , resolveUncached = require("./_resolve-uncached");

test("getNamespacePrefix: Should support DEBUG_COLORS env var", t => {
	t.test("Should force basic colors environment, if \"on\" in non-color environment", t => {
		const { log, getNamespacePrefix } = resolveUncached(() => {
			require("supports-color").stderr = false;
			process.env.DEBUG_COLORS = "on";
			return {
				log: require("log"),
				getNamespacePrefix: require("../../../lib/get-namespace-prefix")
			};
		});

		const prefix = getNamespacePrefix(log.get("foo"));
		t.equal(typeof prefix, "string");
		t.notEqual(prefix, log.get("foo").namespace);
		t.end();
	});
	t.test("Should turn off colors, if \"off\" in colors environment", t => {
		const { log, getNamespacePrefix } = resolveUncached(() => {
			require("supports-color").stderr = { level: 2 };
			process.env.DEBUG_COLORS = "no";
		});

		t.equal(getNamespacePrefix(log.get("foo")), log.get("foo").namespace);
		t.end();
	});
	t.test("Should not have effect in rich colors environment, if \"on\"", t => {
		const { log, getNamespacePrefix } = resolveUncached(() => {
			require("supports-color").stderr = { level: 2 };
			process.env.DEBUG_COLORS = "yes";
		});

		const prefix = getNamespacePrefix(log.get("foo"));
		t.equal(typeof prefix, "string");
		t.notEqual(prefix, log.get("foo").namespace);
		t.end();
	});
	t.test("Should have no effect, if not recognized value", t => {
		const { log, getNamespacePrefix } = resolveUncached(() => {
			require("supports-color").stderr = { level: 2 };
			process.env.DEBUG_COLORS = "habla";
		});

		const prefix = getNamespacePrefix(log.get("foo"));
		t.equal(typeof prefix, "string");
		t.notEqual(prefix, log.get("foo").namespace);
		t.end();
	});

	t.end();
});
