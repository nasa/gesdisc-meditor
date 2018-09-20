import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocCatalogEntry } from '../../../service/model/docCatalogEntry';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';

@Component({
	selector: 'med-search-result',
	templateUrl: './search-result.component.html',
	styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

	@Input() result: DocCatalogEntry;
	@Input() model: ModelCatalogEntry;

	@Output() loadDocument = new EventEmitter<any>();

	constructor() { }

	ngOnInit() {
	}

}
