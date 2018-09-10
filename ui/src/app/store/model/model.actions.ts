export class GetAllModels {
    static readonly type = '[models] get all models';
    
    constructor (public payload: { 
        reload?: boolean, 
    }) {}
}

export class GetModel {
    static readonly type = '[models] get model';

    constructor (public payload: { 
        name: string,
        reload?: boolean, 
    }) {}
}
