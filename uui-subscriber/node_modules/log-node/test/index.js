"use strict";

const test            = require("tape")
    , requireUncached = require("ncjsm/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

const resolveUncached = callback => {
	const { restoreEnv } = overrideEnv();
	try {
		return requireUncached(
			[
				require.resolve("log"), require.resolve("log/lib/abstract-writer"),
				require.resolve("log/lib/private/logger-prototype"),
				require.resolve("log/lib/emitter"), require.resolve("log/lib/get-master-writer"),
				require.resolve("log/lib/setup-visibility"), require.resolve("supports-color"),
				require.resolve("../lib/private/colors-support-level"),
				require.resolve("../lib/resolve-format-parts"), require.resolve("../lib/writer"),
				require.resolve("..")
			],
			() => {
				callback();
				return { log: require("log"), initializeWriter: require("..") };
			}
		);
	} finally {
		restoreEnv();
	}
};

test("(main)", t => {
	t.test(t => {
		const { log, initializeWriter } = resolveUncached(
			() => (require("supports-color").stderr = false)
		);
		initializeWriter(null); // null passed to test no options recoverys
		const originalWrite = process.stderr.write;
		process.stderr.write = string => {
			t.equal(
				string,
				`${ log.error.get("elo").levelMessagePrefix } ${
					log.error.get("elo").namespaceMessagePrefix
				} foo bar\n`,
				"Should write logs for enabled loggers to stderr"
			);
			process.stderr.write = originalWrite;
			t.end();
		};
		log.error.get("elo")("foo bar");
	});
	t.end();
});
