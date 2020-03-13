import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Edge } from '../../../service'

@Component({
    selector: 'med-search-status',
    templateUrl: './search-status.component.html',
    styleUrls: ['./search-status.component.css'],
})
export class SearchStatusComponent implements OnInit {
    @Input() filteredCount: number
    @Input() resultCount: number
    @Input() modelName: string
    @Input() actions: Edge[]
    @Input() privileges: string[]
    @Output() addNew = new EventEmitter<string>()
    @Output() sortByChanged = new EventEmitter()

    sortBy = 'desc'

    constructor() {}

    ngOnInit() {}
}
