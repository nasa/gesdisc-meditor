[![*nix build status][nix-build-image]][nix-build-url]
[![Windows build status][win-build-image]][win-build-url]
[![Tests coverage][cov-image]][cov-url]
![Transpilation status][transpilation-image]
[![npm version][npm-image]][npm-url]

# log-node

## [log](https://github.com/medikoo/log/) writer for typical [Node.js](https://nodejs.org/) processes

-   [Printf-like message formatting](https://github.com/medikoo/log#output-message-formatting)
-   Configure log level visbility threshold through [`LOG_LEVEL`](https://github.com/medikoo/log#log_level) env variable (defaults to `notice`)
-   Extra debug output can be controlled via [`LOG_DEBUG`](https://github.com/medikoo/log#log_debug) env variable (fallbacks to `DEBUG` if provided)
-   Optionally outputs timestamps by log messages, controlled by [`LOG_TIME`](https://github.com/medikoo/log#log_time) env variable
-   Outputs colored logs if terminal supports it (can overriden through `DEBUG_COLORS` env variable)
-   Object inspection depth defaults to `4`, but can be overriden via `LOG_INSPECT_DEPTH` (fallbacks to `DEBUG_DEPTH` if provided)
-   Writes to `stderr` stream.

### Usage

At beginning of main module of your program invoke:

```javascript
require("log-node")();
```

### Tests

    $ npm test

[nix-build-image]: https://semaphoreci.com/api/v1/medikoo-org/log-node/branches/master/shields_badge.svg
[nix-build-url]: https://semaphoreci.com/medikoo-org/log-node
[win-build-image]: https://ci.appveyor.com/api/projects/status/tqetc30h571osc2n?svg=true
[win-build-url]: https://ci.appveyor.com/project/medikoo/log-node
[cov-image]: https://img.shields.io/codecov/c/github/medikoo/log-node.svg
[cov-url]: https://codecov.io/gh/medikoo/log-node
[transpilation-image]: https://img.shields.io/badge/transpilation-free-brightgreen.svg
[npm-image]: https://img.shields.io/npm/v/log-node.svg
[npm-url]: https://www.npmjs.com/package/log-node
