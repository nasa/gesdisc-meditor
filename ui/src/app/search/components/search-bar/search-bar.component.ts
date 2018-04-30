import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ContentType } from '../../../models/content-type';
import { FormControl} from '@angular/forms';

@Component({
	selector: 'med-search-bar',
	templateUrl: './search-bar.component.html',
	styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
	@Input() contentTypes: ContentType[];
	@Input() selectedContentType: ContentType;
	@Input() query: '';
	@Output() selectionChanged = new EventEmitter<ContentType>();

	contentTypeControl = new FormControl();

	ngOnInit() {
		this.contentTypeControl.setValue(this.selectedContentType);
	}
}
