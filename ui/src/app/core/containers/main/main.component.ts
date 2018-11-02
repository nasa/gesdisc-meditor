import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
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

	ngOnInit() {}

}
