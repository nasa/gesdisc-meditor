import { Component, OnInit } from '@angular/core';


@Component({
	selector: 'med-login-page',
	template: `
		<div fxLayout="row" fxLayout.lt-lg="column" fxLayoutAlign="center center" fxFill>
			<mat-card class="login-card">
				<mat-card-title>Welcome!</mat-card-title>
				<mat-card-content>
					<div>
					The Model Editor requires that you
					be an authorized user to add models
					or edit documents, so please...
					</div>
					<med-login class="login-btn">
					</med-login>
					<h5> No account? Please <a href="https://urs.earthdata.nasa.gov">register</a></h5>
				</mat-card-content>	
			</mat-card>			
    </div>
	`,
	styles: [
		`	    
			h5, mat-card-title, mat-card-content {
				text-align: center;
			}	

			.login-card {
				width: 400px;
			}

			.login-btn {
				display: block;
				margin: 10px 0;
			}
  	`
	],
})
export class LoginPageComponent implements OnInit {

	ngOnInit() {}
}
