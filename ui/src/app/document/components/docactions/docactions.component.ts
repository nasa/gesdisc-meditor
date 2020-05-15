import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Edge } from '../../../service'

@Component({
    selector: 'med-document-actions',
    templateUrl: './docactions.component.html',
    styleUrls: ['./docactions.component.css'],
})
export class DocactionsComponent {
    @Input() actions: Edge[]
    @Input() formIsDirty: boolean = false
    @Output() updateState = new EventEmitter<string>()
}
