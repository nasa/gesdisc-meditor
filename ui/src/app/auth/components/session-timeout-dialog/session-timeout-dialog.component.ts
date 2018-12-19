import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { environment } from '../../../../environments/environment';

@Component({
	selector: 'med-session-timeout-dialog',
	template: `
		<mat-dialog-content>
			<h3>Your session has expired, please login again</h3>
			<p>If you were working on something, be sure to close this dialog and copy your changes out.</p>
			<p>Unsaved changes will be lost!</p>
        
			<button mat-button (click)="login()" color="accent" class="login-btn">
				<mat-icon>person</mat-icon>
				Login
			</button>
        </mat-dialog-content>`,
	styles: [
		`
			h1, h5, mat-dialog-content {
				text-align: center;
			}

			h1 {
				font-size: 24px;
			}

			.login-btn {
				margin: 10px 0;
			}
		`
	]
})

export class SessionTimeoutDialog {

	constructor(public dialogRef: MatDialogRef<SessionTimeoutDialog>) {}

	login() {
		window.location.href = this.getApiUrl() + '/login';
	}

	getApiUrl() {
		const basePath = environment.API_BASE_PATH;
		return basePath.indexOf('http') !== 0 ? window.location.origin + basePath : basePath;
	}

}
