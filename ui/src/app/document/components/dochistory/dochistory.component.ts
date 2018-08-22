import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocHistory } from '../../../service/model/docHistory';

@Component({
  selector: 'med-doc-history',
  templateUrl: './dochistory.component.html',
  styleUrls: ['./dochistory.component.scss']
})
export class DochistoryComponent implements OnInit {

	@Input() dochistory: DocHistory[];
	@Input() selectedHistory: string;
	@Output() loadVersion = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {

  }

}
