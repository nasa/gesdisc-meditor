import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs/Observable'
import { timer } from 'rxjs/observable/timer';
import { Store, Select } from '@ngxs/store';
import { AuthState, GetUser } from 'app/store/auth/auth.state';

const KEEP_ALIVE_MILLIS = 10000

@Component({
  selector: 'meditor-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container" fxFill fxLayout="column" fxLayoutAlign="start none">
      <med-toolbar fxFlex="82px"></med-toolbar>
      <div fxFlex="80" style="overflow: scroll; padding: 0 16px;">
        <router-outlet></router-outlet>
      </div>
      <div class="app-version">v{{version}}</div>
      <med-loading></med-loading>
      <med-notification></med-notification>
    </div>
  `,
  styleUrls: ['main.component.scss']
})
export class MainComponent implements OnInit {

  @Select(AuthState.loggedIn) loggedIn$: Observable<boolean>;

  version: string = environment.VERSION
  isLoggedIn: boolean = false

  constructor(private store: Store) { }

	ngOnInit() {
    this.loggedIn$.subscribe((isLoggedIn: boolean) => this.isLoggedIn = isLoggedIn)
    this.keepAlive()
    this.store.dispatch(new GetUser())
  }

  keepAlive() {
    timer(undefined, KEEP_ALIVE_MILLIS).subscribe(() => {
      if (!this.isLoggedIn) return
      this.store.dispatch(new GetUser())
    })
  }

}
