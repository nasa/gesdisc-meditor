import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { DocCatalogEntry } from '../../../service/model/docCatalogEntry'
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry'

@Component({
    selector: 'med-search-result-list',
    templateUrl: './search-result-list.component.html',
    styleUrls: ['./search-result-list.component.css'],
})
export class SearchResultListComponent implements OnInit {
    @Input() results: DocCatalogEntry[]
    @Input() model: ModelCatalogEntry

    @Output() loadDocument = new EventEmitter<string>()

    p: number = 1

    constructor() {}

    ngOnInit() {}
}
