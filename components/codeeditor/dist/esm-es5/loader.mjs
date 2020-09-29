import { a as patchEsm, b as bootstrapLazy } from './index-1c59cf0b.js';
var defineCustomElements = function (win, options) { return patchEsm().then(function () {
    return bootstrapLazy([["code-editor_2", [[0, "code-editor-demo", { "code": [32], "updatedcode": [32] }, [[0, "textChange", "HandletextChange"]]], [0, "code-editor", { "autoUpdateContent": [4, "auto-update-content"], "durationBeforeCallback": [2, "duration-before-callback"], "timeoutSaving": [2, "timeout-saving"], "options": [8], "readOnly": [4, "read-only"], "theme": [513], "mode": [513], "text": [1], "getEditor": [64] }]]]], options);
}); };
export { defineCustomElements };
