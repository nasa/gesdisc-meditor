import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'meditor-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container" fxFill fxLayout="column" fxLayoutAlign="center none">
      <med-toolbar fxFlex="82px"></med-toolbar>
      <div fxFlex="90-100px" style="overflow: scroll; padding: 0 16px;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['main.component.scss']
})
export class MainComponent implements OnInit {

  constructor() {}

  ngOnInit() {  
  }

}
