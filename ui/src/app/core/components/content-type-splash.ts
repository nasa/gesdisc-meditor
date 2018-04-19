import { Component, Input, Output } from '@angular/core';
import { ContentTypeService } from '../services/content-type.service';
import { ContentType } from '../models/content-type';

@Component({
  selector: 'med-content-type-splash',
  templateUrl: `./content-type-splash.html`
})
export class ContentTypeSplashComponent {
  
  contentTypes: ContentType[];

  constructor(
    private contentTypeService: ContentTypeService
  ) { }

  ngOnInit() {
    this.contentTypes = this.contentTypeService.getContentTypes();
  }

}