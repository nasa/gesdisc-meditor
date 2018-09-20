import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetAllModels } from 'app/store/model/model.state';

@Injectable()
export class ModelsResolver implements Resolve<void> {

	constructor(private store: Store) {}

	resolve(route: ActivatedRouteSnapshot) {

		return new Promise<void>((resolve: any) => {
			this.store
				.dispatch(new GetAllModels({reload: false}))
				.subscribe((store: any) => resolve(store.models));
		});
	}
}
