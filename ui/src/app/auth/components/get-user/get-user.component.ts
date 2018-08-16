import { Component, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';
import * as fromApp from '../../../store';
import * as Auth from '../../store';

@Component({
  selector: 'med-get-user',
  templateUrl: './get-user.component.html',
  styleUrls: ['./get-user.component.css']
})
export class GetUserComponent implements OnInit {

  constructor( private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.store.dispatch(new Auth.GetUser());
  }  
}
