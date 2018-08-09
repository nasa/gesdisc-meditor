import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'med-toolbar',
  template: `
    <mat-toolbar class="med-toolbar">
      <img src="assets/logo.png" class="logo" routerLink="/" />
      <span class="spacer"></span>
      <med-login></med-login>
      <button mat-button color="warn">
        <mat-icon>home</mat-icon>
        Home
      </button>
      <button mat-button color="warn">
        <mat-icon>feedback</mat-icon>
        Feedback
      </button>
      <button mat-button color="warn">
        <mat-icon>help</mat-icon>
        Help
      </button>      
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
  `]
})
export class ToolbarComponent {
  @Output() openMenu = new EventEmitter();
}
