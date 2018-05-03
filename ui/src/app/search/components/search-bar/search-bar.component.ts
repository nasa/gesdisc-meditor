import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Model } from '../../../service/model/model';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'med-search-bar',
	templateUrl: './search-bar.component.html',
	styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
	@Input() models: Model[];
	@Input() selectedModel: Model;
	@Input() query: '';
	@Output() selectionChanged = new EventEmitter<Model>();

	modelControl = new FormControl();

	ngOnInit() {
		this.modelControl.setValue(this.selectedModel);
	}
}
