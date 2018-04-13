import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as layout from '../actions/layout';

@Component({
  selector: 'gc-sidenav',
  template: `
    <mat-sidenav [opened]="open" (keydown.escape)="closeSidenav()">
      <mat-nav-list>
        <ng-content></ng-content>
      </mat-nav-list>
      <p><button mat-button (click)="closeSidenav()">Toggle</button></p>
    </mat-sidenav>
  `,
  styles: [
    `
    mat-sidenav {
      width: 300px;
    }
  `,
  ],
})
export class SidenavComponent {
  @Input() open = false;

  constructor(private store: Store<fromRoot.State>) { }

  closeSidenav() {  
    console.log('closing sidenav');  
    this.store.dispatch(new layout.CloseSidenav());
  }
}
