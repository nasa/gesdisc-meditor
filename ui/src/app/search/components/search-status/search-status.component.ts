import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'med-search-status',
  templateUrl: './search-status.component.html',
  styleUrls: ['./search-status.component.css']
})
export class SearchStatusComponent implements OnInit {

	@Input() filteredCount: number;
	@Input() resultCount: number;
	@Input() modelName: string;

	sortBy = 'newest';

  constructor() { }

  ngOnInit() {
  }

}
