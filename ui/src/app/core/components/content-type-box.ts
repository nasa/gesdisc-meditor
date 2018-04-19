import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentType } from '../models/content-type';

@Component({
  selector: 'med-content-type-box',
  templateUrl: `./content-type-box.html`
})
export class ContentTypeBoxComponent {
  @Input() contentType: ContentType;
}