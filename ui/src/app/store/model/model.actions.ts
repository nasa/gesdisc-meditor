export class GetAllModels {
    static readonly type = '[Model] Get All Models';
    
    constructor (public payload: { 
        reload?: boolean, 
    }) {}
}

export class GetModel {
    static readonly type = '[Model] Get Model';

    constructor (public payload: { 
        name: string,
        reload?: boolean, 
    }) {}
}

export class GetModelDocuments {
    static readonly type = '[Model] Get Model Documents'

    constructor (public payload?: {
        reload?: boolean,
    }) {}
}
