import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Model } from '../../../service/model/model';

import * as _ from 'lodash';

@Component({
	selector: 'med-model-button',
	templateUrl: `./model-button.component.html`
})
export class ModelButtonComponent {
	@Input() public model:Model;
	@Output() goToSearch = new EventEmitter<Model>();

	constructor () {}

	ngOnInit() {
		if (_.isNil(this.model.count)) {
			this.model.count = 0;
		}
	}
}
