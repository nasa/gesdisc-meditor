import { Component, OnInit } from '@angular/core';


@Component({
	selector: 'med-login-page',
	template: `
		<div fxLayout="row" fxLayout.lt-lg="column" fxLayoutAlign="center center" fxFill>
      <h3>Sorry, you must be logged in to proceed. Click here <med-login></med-login></h3>
    </div>
	`,
	styles: [
		`
	    h3 {
			font-size: 24px;
			color: grey;
			text-align: center;
		}
  	`
	],
})
export class LoginPageComponent implements OnInit {

	ngOnInit() {}
}
