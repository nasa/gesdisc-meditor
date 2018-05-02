import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Model } from '../../../service/model/model';

@Component({
	selector: 'med-model-button',
	templateUrl: `./model-button.component.html`
})
export class ModelButtonComponent implements OnInit {
	@Input() public model: Model;
	@Output() goToSearch = new EventEmitter<Model>();

	constructor () {}

	ngOnInit() {

	}
}
