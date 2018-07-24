import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'med-toolbar',
  template: `
    <mat-toolbar class="med-toolbar">
      <img src="assets/logo.png" class="logo" routerLink="/" />
      <span class="spacer"></span>
      <a href="" class="toolbar-btn-icon">
      	<mat-icon>home</mat-icon>
      </a>
      <a href="" class="toolbar-btn">
        Feedback
      </a>
      <a href="" class="toolbar-btn">
        Help
      </a>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .logo {
      max-height: 100%;
    }

    .med-toolbar {
    	background: none;
    }

    .toolbar-btn {
    	margin-left: 15px;
    }

    .toolbar-btn-icon {
    	margin-left: 15px;
    	margin-top: 10px;
    }
  `]
})
export class ToolbarComponent {
  @Output() openMenu = new EventEmitter();
}
