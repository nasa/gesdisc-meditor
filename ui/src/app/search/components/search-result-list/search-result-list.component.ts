import { Component, OnInit, Input } from '@angular/core';
import { Document } from '../../../service/model/document';

@Component({
	selector: 'med-search-result-list',
	templateUrl: './search-result-list.component.html',
	styleUrls: ['./search-result-list.component.css']
})
export class SearchResultListComponent implements OnInit {

	@Input() results: Document[];

	constructor() { }

	ngOnInit() {
	}

}
