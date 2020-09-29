import { Component, Prop, Element, Event, Watch, Method } from '@stencil/core';
import 'brace';
export class CodeEditor {
    constructor() {
        this.autoUpdateContent = true;
        this.durationBeforeCallback = 0;
        this.timeoutSaving = 0;
        this.options = {};
        this.readOnly = false;
        this.theme = "ambiance";
        this.mode = "javascript";
        this.text = "";
    }
    setOptions(options) {
        this._editor.setOptions(options || {});
    }
    setReadOnly(readOnly) {
        this._editor.setReadOnly(readOnly);
    }
    //change theme of an editor inside setTheme().
    async setTheme(theme, dynamicImport = true) {
        if (dynamicImport) {
            await import(`https://unpkg.com/brace/theme/${theme}.js`);
        }
        this._editor.setTheme(`ace/theme/monokai`);
    }
    async setMode(mode, dynamicImport = true) {
        if (dynamicImport) {
            await import(`https://unpkg.com/brace/mode/${mode}.js`);
        }
        this._editor.getSession().setMode(`ace/mode/${mode}`);
    }
    // text we disply in codeeditor
    watchText(text) {
        console.log(text);
        if (text === null || text === undefined) {
            text = "";
        }
        if (this.autoUpdateContent === true) {
            this._editor.setValue(text);
        }
    }
    componentDidLoad() {
        this.init();
        this.initEvents();
        this.watchText(this.text);
    }
    async getEditor() {
        return this._editor;
    }
    init() {
        if (this.elm && !this._editor) {
            this._editor = ace.edit(this.elm);
            this._editor.$blockScrolling = Infinity;
        }
        if (this._editor) {
            this.setOptions(this.options || {});
            this.setTheme(this.theme);
            this.setMode(this.mode);
            this.setReadOnly(this.readOnly);
        }
    }
    initEvents() {
        this._editor.on('change', () => this.updateText());
        this._editor.on('paste', () => this.updateText());
    }
    // when there is a textchange inside codeeditor this method will occur
    updateText() {
        let newVal = this._editor.getValue();
        if (newVal === this.oldText) {
            return;
        }
        if (!this.durationBeforeCallback) {
            this.text = newVal;
            this.textChange.emit(newVal);
        }
        else {
            if (this.timeoutSaving) {
                clearTimeout(this.timeoutSaving);
            }
            this.timeoutSaving = setTimeout(() => {
                this.text = newVal;
                this.textChange.emit(newVal);
                this.timeoutSaving = null;
            }, this.durationBeforeCallback);
        }
        this.oldText = newVal;
    }
    static get is() { return "code-editor"; }
    static get originalStyleUrls() { return {
        "$": ["code-editor.css"]
    }; }
    static get styleUrls() { return {
        "$": ["code-editor.css"]
    }; }
    static get properties() { return {
        "autoUpdateContent": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "auto-update-content",
            "reflect": false,
            "defaultValue": "true"
        },
        "durationBeforeCallback": {
            "type": "number",
            "mutable": false,
            "complexType": {
                "original": "number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "duration-before-callback",
            "reflect": false,
            "defaultValue": "0"
        },
        "timeoutSaving": {
            "type": "number",
            "mutable": false,
            "complexType": {
                "original": "number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "timeout-saving",
            "reflect": false,
            "defaultValue": "0"
        },
        "options": {
            "type": "any",
            "mutable": false,
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "options",
            "reflect": false,
            "defaultValue": "{}"
        },
        "readOnly": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "read-only",
            "reflect": false,
            "defaultValue": "false"
        },
        "theme": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "theme",
            "reflect": true,
            "defaultValue": "\"ambiance\""
        },
        "mode": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "mode",
            "reflect": true,
            "defaultValue": "\"javascript\""
        },
        "text": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "text",
            "reflect": false,
            "defaultValue": "\"\""
        }
    }; }
    static get events() { return [{
            "method": "textChange",
            "name": "textChange",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get methods() { return {
        "getEditor": {
            "complexType": {
                "signature": "() => Promise<Editor>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    },
                    "Editor": {
                        "location": "import",
                        "path": "brace"
                    }
                },
                "return": "Promise<Editor>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        }
    }; }
    static get elementRef() { return "elm"; }
    static get watchers() { return [{
            "propName": "options",
            "methodName": "setOptions"
        }, {
            "propName": "readOnly",
            "methodName": "setReadOnly"
        }, {
            "propName": "theme",
            "methodName": "setTheme"
        }, {
            "propName": "mode",
            "methodName": "setMode"
        }, {
            "propName": "text",
            "methodName": "watchText"
        }]; }
}
