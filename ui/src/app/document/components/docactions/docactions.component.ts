import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Edge } from 'app/service';

@Component({
	selector: 'med-document-actions',
	templateUrl: './docactions.component.html',
	styleUrls: ['./docactions.component.css']
})
export class DocactionsComponent implements OnInit {

	@Input() actions: Edge[];
	@Input() canEdit: boolean;
	@Input() canSave: boolean;
	@Output() updateState = new EventEmitter<string>();
	@Output() saveDocument = new EventEmitter();

	constructor() { }

	ngOnInit() {
	}

}
