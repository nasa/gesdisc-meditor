import { Component, OnInit, Input } from '@angular/core';
import { Document } from '../../../service/model/document';

@Component({
	selector: 'med-search-result',
	templateUrl: './search-result.component.html',
	styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

	@Input() result: Document;

	constructor() { }

	ngOnInit() {
	}

}
