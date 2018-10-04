import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetAllModels } from 'app/store/model/model.state';

@Injectable()
export class ModelsResolver implements Resolve<void> {

	constructor(private store: Store) {}

	resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot) {
		let reload: boolean;
		snapshot.url === '/' ? reload = true : reload = false;
		return new Promise<void>((resolve: any) => {
			this.store
				.dispatch(new GetAllModels({reload: reload}))
				.subscribe((store: any) => resolve(store.models));
		});
	}
}
