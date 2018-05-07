import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	OnChanges
} from '@angular/core';
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
	@Output() selectionChanged = new EventEmitter<string>();
	@Output() searchChanged = new EventEmitter<string>();

	query = '';

	modelControl = new FormControl();

	ngOnInit() {
		this.modelControl.setValue(this.selectedModel);
	}

	ngOnChanges() {
		if (this.selectedModel) {
			this.modelControl.setValue(this.selectedModel);
		}
	}

	onSearchChange() {
		this.searchChanged.emit(this.query);
	}
}
