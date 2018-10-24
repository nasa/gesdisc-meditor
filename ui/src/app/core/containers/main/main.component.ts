import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
<<<<<<< HEAD
	selector: 'meditor-app',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="app-container" fxFill fxLayout="column" fxLayoutAlign="center none">
			<med-toolbar fxFlex="82px"></med-toolbar>
			<div fxFlex="90-100px" style="overflow: scroll; padding: 0 16px;">
				<router-outlet></router-outlet>
			</div>
			<med-loading></med-loading>
			<med-notification></med-notification>
		</div>
	`,
	styleUrls: ['main.component.scss']
})
export class MainComponent implements OnInit {

	constructor() {}
=======
  selector: 'meditor-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container" fxFill fxLayout="column" fxLayoutAlign="center none">
      <med-toolbar fxFlex="82px"></med-toolbar>
      <div fxFlex="90-100px" style="overflow: scroll; padding: 0 16px;">
        <router-outlet></router-outlet>
      </div>
      <div class="app-version">v{{version}}</div>
      <med-loading></med-loading>
      <med-notification></med-notification>
    </div>
  `,
  styleUrls: ['main.component.scss']
})
export class MainComponent implements OnInit {

  version: string = environment.VERSION

  constructor() {}
>>>>>>> 29393eb064f79f639a665661898f60136303ed9c

	ngOnInit() {}

}
