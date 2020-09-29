import { Component, h, Listen, State } from '@stencil/core';
export class CodeEditorDemo {
    constructor() {
        this.code = `{
    "data": [
        {
            "name": "big comrporation",
            "numberofemployes" : 1000,
            "ceo": "mary",
            "rating": 3.6
        },
        {
           "name": "small startup",
           "numberofemployes" : 10,
           "ceo": null,
           "rating":3.8
        }
    ]
}`;
    }
    HandletextChange(event) {
        this.updatedcode = event.detail;
    }
    HandleClick() {
        this.code = this.updatedcode;
    }
    render() {
        return (h("div", null,
            h("h1", null, "JSON Editor"),
            h("code-editor", { text: this.code, style: { width: '500px', height: '500px' } }),
            h("button", { onClick: this.HandleClick }, "Save")));
    }
    static get is() { return "code-editor-demo"; }
    static get originalStyleUrls() { return {
        "$": ["code-editor-demo.css"]
    }; }
    static get styleUrls() { return {
        "$": ["code-editor-demo.css"]
    }; }
    static get states() { return {
        "code": {},
        "updatedcode": {}
    }; }
    static get listeners() { return [{
            "name": "textChange",
            "method": "HandletextChange",
            "target": undefined,
            "capture": false,
            "passive": false
        }]; }
}
