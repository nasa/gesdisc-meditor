import { Component, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../reducers';
import * as layout from '../actions/layout';

@Component({
  selector: 'gc-layout',
  template: `
    <mat-sidenav-container fullscreen>
      <ng-content></ng-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
    mat-sidenav-container {
      background: rgba(0, 0, 0, 0.03);
    }

    *, /deep/ * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `,
  ],
})
export class LayoutComponent {

  @Output() backdropClk = new EventEmitter();
}
