import { Component, OnInit, Input } from '@angular/core';
import { Result } from '../../../models/result';

@Component({
	selector: 'med-search-results',
	templateUrl: './search-result-list.component.html',
	styleUrls: ['./search-result-list.component.css']
})
export class SearchResultsComponent implements OnInit {

	@Input() results: Result[];

	constructor() { }

	ngOnInit() {
	}

}
