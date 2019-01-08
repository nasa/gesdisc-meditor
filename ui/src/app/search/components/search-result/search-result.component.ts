import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DocCatalogEntry } from '../../../service/model/docCatalogEntry';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';

@Component({
	selector: 'med-search-result',
	templateUrl: './search-result.component.html',
	styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent {

	@Input() result: DocCatalogEntry | any;
	@Input() model: ModelCatalogEntry;

	@Output() loadDocument = new EventEmitter<any>();

	constructor() { }

	triggerLoadDocument(e: MouseEvent) {
		e.preventDefault();
		this.loadDocument.emit({ title: this.result.title, state: this.result['x-meditor'].state })
	}

}
