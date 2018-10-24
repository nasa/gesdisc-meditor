import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { environment } from '../../../../environments/environment';

@Component({
	selector: 'med-login-dialog',
	template: `
		<h1 mat-dialog-title>Welcome!</h1>
		<mat-dialog-content>
			The Model Editor requires that you
			be an authorized user to add models
			or edit documents, so please...
			<button mat-button (click)="login()" color="accent" class="login-btn">
				<mat-icon>person</mat-icon>
				Login
			</button>
		</mat-dialog-content>
		<h5> No account? Please <a href="https://urs.earthdata.nasa.gov">register</a></h5>`,
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

export class LoginDialog {

	constructor(
		public dialogRef: MatDialogRef<LoginDialog>
	) {}


	login() {
		window.location.href = this.getApiUrl() + '/login';
	}

	getApiUrl() {
		const basePath = environment.API_BASE_PATH;
		return basePath.indexOf('http') !== 0 ? window.location.origin + basePath : basePath;
	}

}
