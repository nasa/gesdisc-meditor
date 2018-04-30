import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as Model from '../actions/model.actions';

@Component({
  selector: 'meditor-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div fxFill fxLayout="column">
      <med-toolbar fxFlex="60px">
      </med-toolbar>
      <div fxFlex="100">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
  ,
})
export class MainComponent implements OnInit {

  constructor(private store: Store<fromRoot.State>) {

  }

  ngOnInit() {
  	this.store.dispatch(new Model.Load());
  }

}
