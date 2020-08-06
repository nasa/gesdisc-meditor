import { Component, ComponentInterface, h, Listen, State } from '@stencil/core';

@Component({
  tag: 'code-editor-demo',
  styleUrl: 'code-editor-demo.css',
  shadow: false
})
export class CodeEditorDemo implements ComponentInterface {
  @State() code = `{
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

  @State() updatedcode: "";

  @Listen('textChange')
  HandletextChange(event) {
    this.updatedcode = event.detail;
  }

  HandleClick() {
    this.code = this.updatedcode;
  }

  render() {
    return (
      <div>
        <h1>JSON Editor</h1>
        <code-editor
          text={this.code}
          style={{ width: '500px', height: '500px' }}
        />
        <button onClick={this.HandleClick}>Save</button>
      </div>
    );
  }
}
