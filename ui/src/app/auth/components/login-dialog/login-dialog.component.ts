import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'med-login-dialog',
	template: `
		<h1 mat-dialog-title>Welcome!</h1>
		<mat-dialog-content>
			The Model Editor requires that you
			be an authorized user to add models
			or edit documents, so please...
			<med-login class="login-btn">
			</med-login>
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
				display: block;
				margin: 10px 0;
			}
		`
	]
})
export class LoginDialog {

  constructor(
    public dialogRef: MatDialogRef<LoginDialog>
  ) {}


  closeDialog(): void {
    this.dialogRef.close();
  }

}