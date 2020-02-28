import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Edge } from 'app/service'

@Component({
    selector: 'med-search-status',
    templateUrl: './search-status.component.html',
    styleUrls: ['./search-status.component.scss'],
})
export class SearchStatusComponent implements OnInit {
    @Input() filteredCount: number
    @Input() resultCount: number
    @Input() modelName: string
    @Input() actions: Edge[]
    @Input() privileges: string[]
    @Input() states: string[]
    @Output() addNew = new EventEmitter<string>()
    @Output() sortByChanged = new EventEmitter()
    @Output() filterByChanged = new EventEmitter()

    sortBy = 'newest'
    filterBy = ''

    constructor() {}

    ngOnInit() {}
}
