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

	successConfig: MatSnackBarConfig;
	failConfig: MatSnackBarConfig;
	defaultConfig: MatSnackBarConfig;

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
			tap(payload => {
				let config;
				switch(payload.config) {
					case 'success':
						config = this.successConfig;
						break;
					case 'failure':
						config = this.failConfig;
						break;
					default:
						config = this.defaultConfig;
				}
				this.matSnackBar.open(payload.message, payload.action, config)
			}),
			delay(5000),
			map(() => new NotificationClose())
		);

	constructor(private actions: Actions,
							private matSnackBar: MatSnackBar) {
		this.successConfig = {
			verticalPosition: 'top',
			panelClass: 'success-notification',
			duration: 3000
		}

		this.failConfig = {
			verticalPosition: 'top',
			panelClass: 'fail-notification',
			duration: 3000
		}

		this.defaultConfig = {
			verticalPosition: 'top',
			duration: 3000
		}
	}

}
