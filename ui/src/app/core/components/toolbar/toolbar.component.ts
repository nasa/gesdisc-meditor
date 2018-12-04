import { Component } from '@angular/core';

@Component({
	selector: 'med-toolbar',
	template: `
		<mat-toolbar class="med-toolbar">
			<img src="assets/logo.png" class="logo" routerLink="/" />
			<span class="spacer"></span>
			<med-login-status></med-login-status>

      <mat-menu #appMenu="matMenu" fxHide.gt-sm>
        <button mat-menu-item routerLink="/">
          <mat-icon>home</mat-icon>
          Home
        </button>
        <a mat-menu-item href="mailto:gsfc-uui-dev-disc@lists.nasa.gov">
          <mat-icon>feedback</mat-icon>
          Feedback
        </a>
        <button mat-menu-item>
          <mat-icon>help</mat-icon>
          Help
        </button>
      </mat-menu>
      <button mat-icon-button [matMenuTriggerFor]="appMenu" fxHide.gt-sm>
        <mat-icon>more_vert</mat-icon>
      </button>
      
      <div fxHide.lt-md>
        <button mat-button class="tb-button" routerLink="/">
          <mat-icon>home</mat-icon>
          Home
        </button>
        <a mat-button class="tb-button" href="mailto:gsfc-uui-dev-disc@lists.nasa.gov">
          <mat-icon>feedback</mat-icon>
          Feedback
        </a>
        <button mat-button class="tb-button">
          <mat-icon>help</mat-icon>
          Help
        </button>
      </div>
		</mat-toolbar>
	`,
	styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent {
}
