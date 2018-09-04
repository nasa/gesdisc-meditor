import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'med-search-status',
  templateUrl: './search-status.component.html',
  styleUrls: ['./search-status.component.css']
})
export class SearchStatusComponent implements OnInit {

	@Input() filteredCount: number;
	@Input() resultCount: number;
  @Input() modelName: string;
  @Input() canAddNew: boolean;
  @Input() addNewLabel: string;
  @Output() addNew = new EventEmitter();
  @Output() sortByChanged = new EventEmitter();

	sortBy: string = 'newest';

  constructor() { }

  ngOnInit() {
  }

}
