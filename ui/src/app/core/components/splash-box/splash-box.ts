import { Component, Input, Output } from '@angular/core';
import { ContentTypeService } from '../../services/content-type.service';
import { ContentType } from '../../models/content-type';

@Component({
  selector: 'med-splash-box',
  templateUrl: `./splash-box.html`
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