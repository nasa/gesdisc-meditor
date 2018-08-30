export class GetDocument {
    static readonly type = '[Document] Get Document';

    constructor (public payload: { 
        model: string,
        title: string,
        titleProperty: string,
        reload?: boolean,
    }) {}
};

export class SaveDocument {
    static readonly type = '[Document] Save Document';

    constructor (public payload: { 
        model: string,
        document: any,
    }) {}
};

export class GetDocumentHistory {
    static readonly type = '[Document] Get Document History'

    constructor (public payload: {
        model: string,
        title: string,
        titleProperty: string,
    }) {}
}
