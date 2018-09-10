import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import * as actions from './router.actions';

export * from './router.actions';

@State({ name: 'router' })
export class RouterState {

    constructor(private router: Router) {}

    @Action(actions.Go)
    go({}, { payload }: actions.Go) {
        this.router.navigate([payload.path], {
            queryParams: payload.query,
            ...payload.extras,
        })
    }

}