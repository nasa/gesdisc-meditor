import { Injectable } from '@angular/core'
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router'
import { Store } from '@ngxs/store'
import { GetAllModels } from 'app/store/model/model.state'

@Injectable()
export class ModelsResolver implements Resolve<void> {
    constructor(private store: Store) {}

    resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot) {
        return new Promise<void>((resolve: any) => {
            this.store
                .dispatch(new GetAllModels({ reload: false })) // don't reload all models, individual model info is updated when user visits the model/search page
                .subscribe((store: any) => resolve(store.models))
        })
    }
}
