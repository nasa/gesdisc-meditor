import { Component, OnInit, Input } from '@angular/core';
import { DocCatalogEntry } from '../../../service/model/docCatalogEntry';
import { Model } from '../../../service/model/model';

@Component({
	selector: 'med-search-result-list',
	templateUrl: './search-result-list.component.html',
	styleUrls: ['./search-result-list.component.css']
})
export class SearchResultListComponent implements OnInit {

	@Input() results: DocCatalogEntry[];
	@Input() model: Model;

	constructor() { }

	ngOnInit() {
	}

}
