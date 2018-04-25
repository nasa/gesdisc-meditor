import { Component, Input, Output } from '@angular/core';
import { ContentTypeService } from '../../services/content-type/content-type.service';
import { ContentType } from '../../models/content-type';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';

import * as fromContentTypes from '../../reducers';
import * as ContentTypes from '../../actions/content-types';

@Component({
  selector: 'med-splash-box',
  templateUrl: `./splash-box.component.html`
})
export class SplashBoxComponent {

  contentTypes$ : Observable<ContentType[]>;

  constructor(
    private contentTypeService: ContentTypeService,
    private store: Store<fromContentTypes.State>,
    private cdRef:ChangeDetectorRef
  ) {
  	this.contentTypes$ = store.pipe(select(fromContentTypes.getAllContentTypes))
  }

  ngOnInit() {
    // get content type list
    // this.contentTypes = this.contentTypeService.listModels();
    this.store.dispatch(new ContentTypes.LoadContentTypes());

  }

}
