import { Component, Injectable, Inject } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA} from "@angular/material";
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
	snackBarRef: any;

	@Effect({
		dispatch: false
	})
	closeNotification$: Observable<any> = this.actions.ofType(NotificationActionTypes.NotificationClose)
		.pipe(
			tap(() => this.matSnackBar.dismiss())
		);

	@Effect()
	showNotification$: Observable<any> = this.actions.ofType(NotificationActionTypes.NotificationOpen)
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
				config.data = payload.message;
				this.snackBarRef = this.matSnackBar.openFromComponent(SnackBarComponent, config);
				this.snackBarRef.instance.snackBarRefComponent = this.snackBarRef;
			}),
			delay(3000),
			map(() => new NotificationClose())
		);

	constructor(
		private actions: Actions,
		private matSnackBar: MatSnackBar) {
			this.successConfig = {
				verticalPosition: 'top',
				panelClass: 'success-notification'
			}

			this.failConfig = {
				verticalPosition: 'top',
				panelClass: 'fail-notification'
			}

			this.defaultConfig = {
				verticalPosition: 'top'
			}
	}

}

@Component({
	selector: 'med-snack-bar',
	template: `
		<span class="message">{{ data }}</span>
		<button mat-icon-button class="close-notif-btn" (click)="close()">
			<mat-icon align="end">close</mat-icon>
		</button>
	`,
	styles: [`	
		.message {
    		font-size: 14px;
		}

		.close-notif-btn {
			position: absolute;
			top: 5px;
			right: 11px;
		}
	`],
})
export class SnackBarComponent {

	public snackBarRefComponent: any;

	constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

	close() {
		this.snackBarRefComponent.dismiss();
	}
}
