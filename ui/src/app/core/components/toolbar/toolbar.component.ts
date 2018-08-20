import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'med-toolbar',
  template: `
    <mat-toolbar class="med-toolbar">
      <img src="assets/logo.png" class="logo" routerLink="/" />
      <span class="spacer"></span>
      <med-login-status></med-login-status>
      <button mat-button class="tb-button" routerLink="/">
        <mat-icon>home</mat-icon>
        Home
      </button>
      <a mat-button class="tb-button" href="mailto:mahabaleshwa.s.hegde@nasa.gov">
        <mat-icon>feedback</mat-icon>
        Feedback
      </a>
      <button mat-button class="tb-button">
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

    .tb-button {
      margin-left: 10px;
      color: grey;
    }
  `]
})
export class ToolbarComponent {
  @Output() openMenu = new EventEmitter();
}
