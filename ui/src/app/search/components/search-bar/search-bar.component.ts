import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import * as fromContentTypes from '@reducers/index';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ContentType } from '@models/content-type';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as ContentTypes from '../../../core/actions/content-types';


@Component({
  selector: 'med-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  contentTypes$ : Observable<ContentType[]>;
  selected$: Observable<ContentType>;

	constructor(
    private store: Store<fromContentTypes.State>,
    private router: Router,
  	private route: ActivatedRoute,
  	private cdRef:ChangeDetectorRef
  ) {
  	this.contentTypes$ = store.pipe(select(fromContentTypes.getAllContentTypes))
  	this.selected$ = store.pipe(select(fromContentTypes.selectCurrentContentType))

  	//this.selected$.subscribe(p => {console.log(p)})
  }

  ngOnInit() {
  	this.cdRef.detectChanges();
  	this.route.queryParams.subscribe((params: Params) => {
      this.store.dispatch(new ContentTypes.SelectContentType(params['byType']));
    });
  }

  select(event) {
  	this.store.dispatch(new ContentTypes.SelectContentType(event.value.name));
  	this.changeQueryByType(event.value.name)
  }

  changeQueryByType(type) {
	  this.router.navigate(['.'], { relativeTo: this.route, queryParams: { byType: type }});
	}

}
