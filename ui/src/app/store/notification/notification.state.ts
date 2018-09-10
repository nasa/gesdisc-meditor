import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import * as actions from './notification.actions';

export * from './notification.actions';

export interface NotificationStateModel {
    show: boolean;
    message: string;
    action?: string;
    config?: string;    
}

@State<NotificationStateModel>({
    name: 'notification',
    defaults: {
        show: false,
        message: undefined,
        action: undefined,
        config: undefined,
    },
})
export class NotificationState {

    @Action(actions.NotificationOpen)
    openNotification({ patchState }: StateContext<NotificationStateModel>, { payload }: actions.NotificationOpen) {
        patchState({ ...payload, show: true })
    }

    @Action(actions.NotificationClose)
    closeNotification({ patchState }: StateContext<NotificationStateModel>) {
        patchState({ show: false })
    }

}