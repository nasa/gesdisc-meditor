import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit
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

	query: string = '';
	modelControl = new FormControl(this.selectedModel);

	
	ngOnInit() {
		// console.log(this.selectedModel);
		// this.modelControl = new FormControl(this.selectedModel);
		// console.log(this.modelControl);
	}

	onSearchChange() {
		this.searchChanged.emit(this.query);
	}
}
