import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { MatSnackBarConfig } from "@angular/material";
import { Actions, Effect } from "@ngrx/effects";
import { Observable } from "rxjs/Observable";
import { delay, map, tap } from "rxjs/operators";
import {
	NotificationActionTypes,
	NotificationActionsUnion,
	NotificationOpen,
	NotificationClose
} from "../actions/notification.actions";

@Injectable()
export class NotificationEffects {

	defaultConfig: MatSnackBarConfig = {};

	@Effect({
		dispatch: false
	})
	closeNotification: Observable<any> = this.actions.ofType(NotificationActionTypes.NotificationClose)
		.pipe(
			tap(() => this.matSnackBar.dismiss())
		);

	@Effect()
	showNotification: Observable<any> = this.actions.ofType<NotificationOpen>(NotificationActionTypes.NotificationOpen)
		.pipe(
			map((action: NotificationOpen) => action.payload),
			tap(payload => this.matSnackBar.open(payload.message, payload.action, payload.config ? payload.config : this.defaultConfig)),
			delay(2000),
			map(() => new NotificationClose())
		);

	constructor(private actions: Actions,
							private matSnackBar: MatSnackBar) {
		this.defaultConfig.verticalPosition = 'top'
	}

}
