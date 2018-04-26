import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ContentType } from '@models/content-type';
import * as _ from 'lodash';

@Component({
  selector: 'med-content-type-button',
  templateUrl: `./content-type-button.component.html`
})
export class ContentTypeButtonComponent {
  @Input() public contentType:ContentType;

  constructor (private router: Router) {}

  ngOnInit() {
    if (_.isNil(this.contentType.count)) {
      this.contentType.count = 0;
    }
  }

  goSearch() {
  	this.router.navigate(['/search'], {queryParams: { byType: this.contentType.name }});
  }
}
