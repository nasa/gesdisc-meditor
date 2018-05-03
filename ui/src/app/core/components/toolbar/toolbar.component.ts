import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'med-toolbar',
  template: `
    <mat-toolbar class="med-toolbar">
      <img src="assets/logo.png" class="logo"/>
      <span class="spacer"></span>
      <button mat-raised-button color="primary" class="toolbar-btn">
        <mat-icon>feedback</mat-icon>
        Feedback
      </button>
      <button mat-raised-button color="primary" class="toolbar-btn">
        <mat-icon>help</mat-icon>
        Help
      </button>
      <med-login></med-login>
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
    	margin-right: 15px;
    }
  `]
})
export class ToolbarComponent {
  @Output() openMenu = new EventEmitter();
}
