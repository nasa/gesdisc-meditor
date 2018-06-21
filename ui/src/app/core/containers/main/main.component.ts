import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';


import * as fromModel from '../../../reducers';
import * as Model from '../../actions/model.actions';

@Component({
  selector: 'meditor-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div fxFill fxLayout="column" fxLayoutAlign="center none">
      <med-toolbar fxFlex="70px">
      </med-toolbar>
      <div fxFlex="100-70px" style="overflow: scroll;">
	      <div fxFill fxLayout="row">
					<div fxFlex="10"></div>
					<div fxFlex="80">
	        	<router-outlet></router-outlet>
	        </div>
	        <div fxFlex="10"></div>
	      </div>
     	</div>
    </div>
  `
  ,
})
export class MainComponent implements OnInit {

  constructor(
  	private store: Store<fromModel.State>) {}

  ngOnInit() {
  	this.store.dispatch(new Model.Load());
  }

}
