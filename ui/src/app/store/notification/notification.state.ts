import { State, Action, StateContext, Store } from '@ngxs/store';
import * as actions from './notification.actions';

export * from './notification.actions';

export interface NotificationStateModel {
    show: boolean;
    message: string;
    action?: string;    
}

@State<NotificationStateModel>({
    name: 'notification',
    defaults: {
        show: false,
        message: undefined,
        action: undefined,
    },
})
export class NotificationState {

    constructor(private store: Store) {}

    @Action(actions.NotificationOpen)
    openNotification({ patchState }: StateContext<NotificationStateModel>, { message }: actions.NotificationOpen) {
        patchState({ message, action: undefined, show: true })
    }

    @Action(actions.SuccessNotificationOpen)
    successNotificationOpen({ patchState }: StateContext<NotificationStateModel>, { message }: actions.SuccessNotificationOpen) {
        patchState({ message, action: 'success', show: true });
    }

    @Action(actions.ErrorNotificationOpen)
    errorNotificationOpen({ patchState }: StateContext<NotificationStateModel>, { message }: actions.ErrorNotificationOpen) {
        patchState({ message, action: 'fail', show: true });
    }

    @Action(actions.NotificationClose)
    closeNotification({ patchState }: StateContext<NotificationStateModel>) {
        patchState({ show: false })
    }

}