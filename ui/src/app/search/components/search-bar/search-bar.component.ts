import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ModelCatalogEntry } from '../../../service'

@Component({
    selector: 'med-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
    @Input() models: ModelCatalogEntry[]
    @Input() selectedModel: ModelCatalogEntry
    @Input() searchTerm: string
    @Output() selectionChanged = new EventEmitter<string>()
    @Output() searchChanged = new EventEmitter<string>()

    query: string
    modelcontrol = new FormControl()

    ngOnInit() {
        this.query = this.searchTerm
        this.setModelControl()
    }

    ngOnChanges() {
        this.query = this.searchTerm
        this.setModelControl()
    }

    onSearchChange() {
        this.searchChanged.emit(this.query)
    }

    setModelControl() {
        const i = this.models.map(m => m.name).indexOf(this.selectedModel.name)
        this.modelcontrol.setValue(this.models[i])
    }
}
