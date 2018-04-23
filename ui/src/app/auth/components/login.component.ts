import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { Store, select } from '@ngrx/store';
import { Authenticate } from '../models/user';
import * as fromAuth from '../reducers';
import * as Auth from '../actions/auth';



@Component({
  selector: 'med-login',
  template: `<a mat-raised-button href="http://localhost:4201/login" color="warn">Earthdata Login</a>`
  ,
  styles: [
    `
    :host {
      display: flex;
      justify-content: center;
      margin: 72px 0;
    }

    .mat-form-field {
      width: 100%;
      min-width: 300px;
    }

    mat-card-title,
    mat-card-content {
      display: flex;
      justify-content: center;
    }

    .loginError {
      padding: 16px;
      width: 300px;
      color: white;
      background-color: red;
    }

    .loginButtons {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
  `,
  ],
})
export class LoginComponent implements OnInit {

  constructor(private store: Store<fromAuth.State>) {

	}

	ngOnInit() {}

	// onSubmit($event: Authenticate) {
	// 	this.store.dispatch(new Auth.Login($event));
	// }


}
