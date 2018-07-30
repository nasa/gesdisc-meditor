import { Component, OnInit } from '@angular/core';

import * as fromApp from '../../../store';
import * as fromDocument from '../../store';
import { Model } from '../../../service/model/model';

import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'med-docnew-page',
  templateUrl: './docnew-page.component.html',
  styleUrls: ['./docnew-page.component.css']
})
export class DocNewPageComponent implements OnInit {

	modelName: string;
	titleProperty: string;
	model$: Observable<Model>;

  

	constructor(		
		private store: Store<fromApp.AppState>
	) {
	}

	ngOnInit() {	
		this.model$ = this.store.pipe(select(fromApp.getCurrentModel));		
		this.model$.subscribe(model => {
			this.modelName = model.name;
			this.titleProperty = model.titleProperty || 'title';
		});		
	}

	submitDocument(data: any) {
		data['x-meditor'] = {
			model: this.modelName
		};
    this.store.dispatch(new fromDocument.SubmitDocument(data));
	}	

}
