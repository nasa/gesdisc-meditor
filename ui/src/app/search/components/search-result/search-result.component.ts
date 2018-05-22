import { Component, OnInit, Input } from '@angular/core';
import { Searchresult } from '../../../service/model/searchresult';
import { Model } from '../../../service/model/model';

@Component({
	selector: 'med-search-result',
	templateUrl: './search-result.component.html',
	styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

	@Input() result: Searchresult;
	@Input() model: Model;

	constructor() { }

	ngOnInit() {
	}

}
