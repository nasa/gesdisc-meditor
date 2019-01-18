import { Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
	selector: 'med-toolbar',
	template: `
		<mat-toolbar class="med-toolbar">
			<img src="assets/logo.png" class="logo" routerLink="/" />
			<span class="spacer"></span>
			<med-login-status></med-login-status>

      <mat-menu fxHide.gt-sm>
        <button mat-menu-item routerLink="/">
          <mat-icon>home</mat-icon>
          Home
        </button>
        <a mat-menu-item href="mailto:gsfc-uui-dev-disc@lists.nasa.gov">
          <mat-icon>feedback</mat-icon>
          Feedback
        </a>
        <a mat-menu-item [href]="helpDocumentLocation" target="_blank">
          <mat-icon>help</mat-icon>
          Help
        </a>
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
        <a mat-button class="tb-button" [href]="helpDocumentLocation" target="_blank">
          <mat-icon>help</mat-icon>
          Help
        </a>
      </div>
		</mat-toolbar>
	`,
	styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent {

  helpDocumentLocation = environment.HELP_DOCUMENT_LOCATION

}
