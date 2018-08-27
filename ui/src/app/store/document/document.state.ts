import { State, Action } from '@ngxs/store';
import { Document, } from '../../service/model/document';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './document.actions';

export * from './document.actions';

@State<Document>({
    name: 'currentDocument',
})
export class DocumentState {

    constructor(private documentService: DefaultService) {}

    @Action(actions.FetchDocument)
    load({ getState }, payload: any) {
        console.log(' in load with ', getState(), payload)
    
        //this.documentService
    }

}