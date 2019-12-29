import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef,
    Renderer2,
} from '@angular/core'
import isEqual from 'lodash/isEqual' // lodash/isMatch does deep comparison, underscore/isMatch is shallow
import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash.clonedeep'
import * as _ from 'underscore'
// @ts-ignore
import React from 'react'
import ReactDOM from 'react-dom'
import Form from 'react-jsonschema-form'

const log = (type: any) => console.log.bind(console, type)

@Component({
    selector: 'med-document-edit',
    templateUrl: './document-edit.component.html',
    styleUrls: ['./document-edit.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentEditComponent {
    @ViewChild('reactform') reactformRef: ElementRef

    constructor(private renderer2: Renderer2) {}

    @Input()
    set document(document: any) {
        if (document.schema) {
            const schemaString = document.schema.replace("'", '')
            this.schema = JSON.parse(schemaString)
        }

        this.data = document.doc
        try {
            delete this.data.banTransitions
            delete this.data._id
        } catch (err) {}

        this.renderSchemaInForm()
    }

    @Input()
    set model(model: any) {
        this.uiSchema = model.uiSchema || '{}'
        this.renderSchemaInForm()
    }

    @Input() readonly: boolean

    @Output() liveData = new EventEmitter<object>()
    @Output() isValid = new EventEmitter<boolean>()
    @Output() isDirty = new EventEmitter<boolean>()

    schema = {}
    data: any
    uiSchema = '{}'

    formIsValid: boolean
    expandAll: boolean
    showExpandButton: boolean

    ngOnInit() {
        //remove react form Submit button

        let btns = this.reactformRef.nativeElement.querySelectorAll('.btn')
        let submit = btns[btns.length - 1]
        this.renderer2.removeChild(this.reactformRef.nativeElement, submit)
    }

    renderSchemaInForm() {
        if (!this.schema || !this.uiSchema) return

        console.log('render schema in form ')

        // make a copy of the form data, otherwise angular will trigger validation for every field
        // on every change
        let formData = cloneDeep(this.data)

        ReactDOM.render(
            React.createElement(
                Form,
                {
                    schema: this.schema,
                    formData,
                    uiSchema: JSON.parse(this.uiSchema),
                    liveValidate: true,
                    //widgets,
                    onChange: (e: any) => {
                        this.isFormValid(isEmpty(e.errors))
                        this.onChanges(e.formData)
                    },
                    onSubmit: (e: any) => {},
                    onError: log('errors'),
                },
                null
            ),
            this.reactformRef.nativeElement
        )
    }

    ngOnDestroy() {
        ReactDOM.unmountComponentAtNode(this.reactformRef.nativeElement)
    }

    onChanges(data: any) {
        Object.keys(data).forEach(key =>
            data[key] === undefined ? delete data[key] : ''
        )
        this.isDirty.emit(!isEqual(this.data, data))
        this.liveData.emit(data)
    }

    isFormValid(isvalid: boolean): void {
        this.isValid.emit(isvalid)
    }
}
