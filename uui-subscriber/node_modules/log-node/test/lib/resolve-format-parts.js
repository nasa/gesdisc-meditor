"use strict";

const d               = require("d")
    , test            = require("tape")
    , requireUncached = require("ncjsm/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

const normalizeParts = parts => {
	parts.substitutions = parts.substitutions.map(substitution => substitution.value);
	return parts;
};

const resolveUncached = callback => {
	const { restoreEnv } = overrideEnv();
	try {
		return requireUncached(
			[
				require.resolve("log/lib/emitter"), require.resolve("log"),
				require.resolve("log/lib/private/logger-prototype"),
				require.resolve("../../lib/resolve-format-parts"),
				require.resolve("supports-color"),
				require.resolve("../../lib/private/colors-support-level"),
				require.resolve("../../lib/private/inspect-depth")
			],
			() => {
				callback();
				return require("../../lib/resolve-format-parts");
			}
		);
	} finally {
		restoreEnv();
	}
};

test("formatPartsResolver", t => {
	t.test(t => {
		const formatPartsResolver = resolveUncached(
			() => (require("supports-color").stderr = false)
		);
		const testObj = Object.defineProperties({ foo: "bar" }, { hidden: d("elo") });
		t.deepEqual(
			normalizeParts(
				formatPartsResolver(
					"foo bar %d %f %i %j %o %O then%s", 20.2, 21.21, 22.22, testObj, testObj,
					testObj, "maro", "rest", "arg"
				)
			),
			{
				literals: ["foo bar ", " ", " ", " ", " ", " ", " then", ""],
				substitutions: [
					"20.2", "21.21", "22", "{ \"foo\": \"bar\" }",
					"{ foo: 'bar', [hidden]: 'elo' }", "{ foo: 'bar' }", "maro"
				],
				rest: " 'rest' 'arg'"
			},
			"Supports sprintf formatting with rest params"
		);
		t.end();
	});
	t.test(t => {
		const formatPartsResolver = resolveUncached(
			() => (require("supports-color").stderr = { level: 1 })
		);

		t.deepEqual(
			normalizeParts(formatPartsResolver("%j %j", { foo: "bar" }, 1)),
			{
				literals: ["", " ", ""],
				substitutions: ["{ \"foo\": \x1b[32m\"bar\"\x1b[39m }", "\x1b[33m1\x1b[39m"],
				rest: null
			},
			"Supports sprintf formatting with colors"
		);
		t.end();
	});
	t.test(t => {
		const formatPartsResolver = resolveUncached(() => {
			process.env.LOG_INSPECT_DEPTH = "1";
			require("supports-color").stderr = false;
		});
		t.deepEqual(
			normalizeParts(formatPartsResolver({ foo: 12, bar: { elo: { frelo: 22 } } })),
			{ literals: [], substitutions: [], rest: "{ foo: 12, bar: { elo: [Object] } }" },
			"Supports customization of inspect depth via LOG_INSPECT_DEPTH var"
		);
		t.end();
	});

	t.end();
});
