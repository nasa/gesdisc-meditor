import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentType } from '../../models/content-type';

@Component({
  selector: 'med-content-type-button',
  templateUrl: `./content-type-button.html`
})
export class ContentTypeBoxComponent {
  @Input() contentType: ContentType;
}