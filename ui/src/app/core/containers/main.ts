import { Observable } from 'rxjs/Observable';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '@reducers/index';
import * as fromAuth from '../../auth/reducers';
import * as layout from '../actions/layout';
import * as Auth from '../../auth/actions/auth';
import * as ContentTypes from '../actions/content-types';

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
  	this.store.dispatch(new ContentTypes.LoadContentTypes());
  }

}
