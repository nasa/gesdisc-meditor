import { Component, Input, Output } from '@angular/core';
import { ContentTypeService } from '../../services/content-type.service';
import { ContentType } from '../../models/content-type';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'med-splash-box',
  templateUrl: `./splash-box.component.html`
})
export class ContentTypeSplashComponent {
  
  contentTypes : ContentType[];

  constructor(
    private contentTypeService: ContentTypeService,
    private cdRef:ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getContentTypes();
  }

  getContentTypes() {
    // get content type list
    this.contentTypeService.listModels().subscribe(
      data => { 
        this.contentTypes = data;
        this.cdRef.detectChanges();
      },
      err => console.error(err)
    );
  }
}