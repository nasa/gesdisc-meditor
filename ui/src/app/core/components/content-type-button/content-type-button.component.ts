import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentType } from '../../models/content-type';
import * as _ from 'lodash';

@Component({
  selector: 'med-content-type-button',
  templateUrl: `./content-type-button.component.html`
})
export class ContentTypeButtonComponent {
  @Input() public contentType:ContentType;

  ngOnInit() {
    if (_.isNil(this.contentType.count)) {
      this.contentType.count = 0;
    }
  }
}