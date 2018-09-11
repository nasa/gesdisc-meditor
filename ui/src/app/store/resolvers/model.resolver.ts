import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetModel } from 'app/store/model/model.state';

@Injectable()
export class ModelResolver implements Resolve<void> {

    constructor(private store: Store) {}

	resolve(route: ActivatedRouteSnapshot) {
        let name = route.queryParams.model;

        return new Promise<void>((resolve:any) => {
            this.store
                .dispatch(new GetModel({ name }))
                .subscribe((store:any) => resolve(store.models.currentModel));
        });
	}
}
