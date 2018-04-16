import { Component, OnInit } from '@angular/core';


@Component({
	selector: 'med-login-page',
	template: `
		<div fxLayout="row" fxLayout.lt-lg="column" fxLayoutAlign="center center" fxFill>
      <mat-card>
        <mat-card-content>
         	Login please
         	<med-login></med-login>
        </mat-card-content>
      </mat-card>
    </div>
	`,
	styles: [
		`
	    mat-card {
	      margin: 10px;
	    }

	    mat-card-content {
	      text-align: center;
	      font-size: 1.5em;
	    }
  	`
	],
})
export class LoginPageComponent implements OnInit {


	ngOnInit() {}

}
