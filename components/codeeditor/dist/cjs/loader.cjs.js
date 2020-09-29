'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-2da49179.js');

const defineCustomElements = (win, options) => index.patchEsm().then(() => {
  return index.bootstrapLazy([["code-editor_2.cjs",[[0,"code-editor-demo",{"code":[32],"updatedcode":[32]},[[0,"textChange","HandletextChange"]]],[0,"code-editor",{"autoUpdateContent":[4,"auto-update-content"],"durationBeforeCallback":[2,"duration-before-callback"],"timeoutSaving":[2,"timeout-saving"],"options":[8],"readOnly":[4,"read-only"],"theme":[513],"mode":[513],"text":[1],"getEditor":[64]}]]]], options);
});

exports.defineCustomElements = defineCustomElements;
