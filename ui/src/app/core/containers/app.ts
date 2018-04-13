import { Observable } from 'rxjs/Observable';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as fromAuth from '../../auth/reducers';
import * as layout from '../actions/layout';
import * as Auth from '../../auth/actions/auth';

@Component({
  selector: 'meditor-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  	<med-toolbar>
    </med-toolbar>
  	<router-outlet></router-outlet>
  `
  // `
  //   <gc-layout>
  //     <gc-sidenav [open]="showSidenav$ | async">
  //       <gc-nav-item (navigate)="closeSidenav()" *ngIf="loggedIn$ | async" routerLink="/addplot/map" icon="map" hint="">
  //         Create a map
  //       </gc-nav-item>
  //       <gc-nav-item (navigate)="closeSidenav()" *ngIf="loggedIn$ | async" routerLink="/addplot/lineplot" icon="timeline" hint="">
  //         Create a time-series
  //       </gc-nav-item>
  //       <gc-nav-item (navigate)="closeSidenav()" *ngIf="!(loggedIn$ | async)">
  //         Sign In
  //       </gc-nav-item>
  //       <gc-nav-item (navigate)="logout()" *ngIf="loggedIn$ | async">
  //         Sign Out
  //       </gc-nav-item>
  //     </gc-sidenav>
  //     <gc-toolbar (openMenu)="openSidenav()">

  //     </gc-toolbar>
  //     <router-outlet></router-outlet>
  //   </gc-layout>

  //   `
  ,
})
export class AppComponent {
  showSidenav$: Observable<boolean>;
  loggedIn$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {
    /**
     * Selectors can be applied with the `select` operator which passes the state
     * tree to the provided selector
     */
    this.showSidenav$ = this.store.pipe(select(fromRoot.getShowSidenav));
    this.loggedIn$ = this.store.pipe(select(fromAuth.getLoggedIn));
  }

  closeSidenav() {
    /**
     * All state updates are handled through dispatched actions in 'container'
     * components. This provides a clear, reproducible history of state
     * updates and user interaction through the life of our
     * application.
     */
    this.store.dispatch(new layout.CloseSidenav());
  }

  openSidenav() {
    this.store.dispatch(new layout.OpenSidenav());
  }

  logout() {
    this.closeSidenav();

    this.store.dispatch(new Auth.Logout());
  }
}
