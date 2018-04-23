import { Component, Input, Output } from '@angular/core';
import { ContentTypeService } from '../../services/content-type.service';
import { ContentType } from '../../models/content-type';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'med-splash-box',
  templateUrl: `./splash-box.component.html`
})
export class ContentTypeSplashComponent {
  
  contentTypes : Observable<Array<ContentType>>;

  constructor(
    private contentTypeService: ContentTypeService,
    private cdRef:ChangeDetectorRef
  ) { }

  ngOnInit() {
    // get content type list
    this.contentTypes = this.contentTypeService.listModels();
  }

}