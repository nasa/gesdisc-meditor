import { NotificationActionTypes, NotificationActionsUnion } from "../actions/notification.actions";

export interface State {
	show: boolean;
}

const initialState: State = {
	show: false
};

export function reducer(state: State = initialState, action: NotificationActionsUnion) {
	switch(action.type) {
		case NotificationActionTypes.NotificationClose:
			return { ...state, show: false };
		case NotificationActionTypes.NotificationOpen:
			return { ...state, show: true };
		default:
			return state;
	}
}
