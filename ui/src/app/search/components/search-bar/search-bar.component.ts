import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	OnChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModelCatalogEntry } from '../../../service';

@Component({
	selector: 'med-search-bar',
	templateUrl: './search-bar.component.html',
	styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
	@Input() models: ModelCatalogEntry[];
	@Input() selectedModel: ModelCatalogEntry;
	@Output() selectionChanged = new EventEmitter<string>();
	@Output() searchChanged = new EventEmitter<string>();

	query = '';

	modelControl = new FormControl();

	ngOnInit() {
		this.modelControl.setValue({name: this.selectedModel.name, icon: this.selectedModel.icon});
	}

	// ngOnChanges() {
	// 	if (this.selectedModel) {
	// 		this.modelControl.setValue({name: this.selectedModel.name, icon: this.selectedModel.icon});
	// 	}
	// }

	onSearchChange() {
		this.searchChanged.emit(this.query);
	}
}
