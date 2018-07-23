import { MatSnackBarConfig } from "@angular/material";
import { Action } from '@ngrx/store';

export enum NotificationActionTypes {
	NotificationOpen = '[Notification] Open notificaton',
	NotificationClose = '[Notification] Close notificaton'
}

export class NotificationOpen implements Action {
  readonly type = NotificationActionTypes.NotificationOpen;

  constructor(public payload: {
    message: string,
    action?: string,
    config?: string
  }) { }

}

export class NotificationClose implements Action {
  readonly type = NotificationActionTypes.NotificationClose;
}


export type NotificationActionsUnion =
	| NotificationOpen
	| NotificationClose;
