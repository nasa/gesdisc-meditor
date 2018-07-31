import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { RouterStateSnapshot, ActivatedRouteSnapshot, Resolve } from '@angular/router';

import * as fromDocument from '..';

@Injectable()
export class DocumentResolver implements Resolve<void> {
    constructor(private store: Store<fromDocument.DocumentDataState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        this.store.dispatch(new fromDocument.LoadDocument({model: route.queryParams['model'], title: route.queryParams['title']}));
    }
}