import { Component, OnInit, Input } from '@angular/core';
import * as fromContentTypes from '@reducers/index';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ContentType } from '@models/content-type';

@Component({
  selector: 'med-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  contentTypes$ : Observable<ContentType[]>;

  selected = {
  	name: 'Alerts',
  	icon: { name: 'alerts', color: 'green'}
  };

	constructor(
    private store: Store<fromContentTypes.State>
  ) {
  	this.contentTypes$ = store.pipe(select(fromContentTypes.getAllContentTypes))
  }

  ngOnInit() {}

}
