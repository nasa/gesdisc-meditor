import { Component, OnInit } from '@angular/core';

import { Store, select } from '@ngrx/store';
import * as fromApp from '../../../store';
import * as Auth from '../../actions/auth';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'med-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  code: string;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
    });
    console.log('in callback');
    console.log(this.code);
    window.location.href = 'http://localhost:8081/meditor/api/login?code=' + this.code;   
    //this.store.dispatch(new Auth.LoginCallback(this.code));
  }

}
