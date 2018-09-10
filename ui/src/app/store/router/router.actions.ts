import { NavigationExtras } from '@angular/router';

export class Go {
    static readonly type = '[Router] Go';

    constructor (public payload: { 
        path: string,
        query?: object,
        extras?: NavigationExtras,
    }) {}
};
