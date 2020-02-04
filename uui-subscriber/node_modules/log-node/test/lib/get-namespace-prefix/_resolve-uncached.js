"use strict";

const requireUncached = require("ncjsm/require-uncached")
    , overrideEnv     = require("process-utils/override-env");

module.exports = callback => {
	const { restoreEnv } = overrideEnv();
	try {
		return requireUncached(
			[
				require.resolve("log"), require.resolve("log/lib/abstract-writer"),
				require.resolve("log/lib/private/logger-prototype"),
				require.resolve("log/lib/emitter"),
				require.resolve("log/lib/get-default-namespace"),
				require.resolve("../../../lib/get-namespace-prefix"),
				require.resolve("supports-color"),
				require.resolve("../../../lib/private/colors-support-level")
			],
			() => {
				callback();
				return {
					log: require("log"),
					getNamespacePrefix: require("../../../lib/get-namespace-prefix")
				};
			}
		);
	} finally {
		restoreEnv();
	}
};
