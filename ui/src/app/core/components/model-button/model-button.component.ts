import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';

@Component({
	selector: 'med-model-button',
	template: `
		<button color="primary" (click)="goToSearch.emit(model)" fxFlex="100px"
			mat-raised-button style="line-height: inherit; padding: 10px;" >
		  <i class="icon-badge icon-badge-lg fa {{model.icon?.name}} align-middle" style="margin-bottom: 5px;" [style.background-color]="model.icon?.color"></i>
		  <div style="font-weight: bold;">{{model.name}}</div>
		  <div>({{model['x-meditor'] && model['x-meditor'].count ? model['x-meditor'].count : 0}})</div>
		</button>
	`
})

export class ModelButtonComponent implements OnInit {

	@Input() public model: ModelCatalogEntry;
	@Output() goToSearch = new EventEmitter<ModelCatalogEntry>();

	constructor () {}

	ngOnInit() {

	}
}
