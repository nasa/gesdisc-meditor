import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Edge } from 'app/service';

@Component({
	selector: 'med-document-actions',
	templateUrl: './docactions.component.html',
	styleUrls: ['./docactions.component.css']
})
export class DocactionsComponent implements OnInit {

	@Input() actions: Edge[];
	@Output() updateState = new EventEmitter<string>();

	constructor() { }

	ngOnInit() {
	}

}
