import { Component, OnInit, Inject } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import * as fromApp from '../../../store';
import * as fromAuth from '../../../auth/store';

@Component({
	selector: 'med-splash-page',
	templateUrl: './splash-page.component.html',
	styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent implements OnInit{

	models$: Observable<ModelCatalogEntry[]>;
	adminModels$: Observable<ModelCatalogEntry[]>;
	loggedIn$: Observable<boolean>;

	constructor(
		public dialog: MatDialog,
		private store: Store<fromApp.AppState>
	) {
		this.models$ = store.pipe(select(fromApp.getNonAdminModels));
		this.adminModels$ = store.pipe(select(fromApp.getAdminModels));
		this.loggedIn$ = store.pipe(select(fromAuth.getLoggedIn));
	}

	ngOnInit () {	
    localStorage.clear();
		this.store.dispatch(new fromApp.LoadModels());		
		// instead of just `this.openDialog()` this is a workaround to avoid ExpressionChangedAfterItHasBeenCheckedError
		this.loggedIn$.subscribe(status => {
			if (!status) { setTimeout(() => this.openDialog()) }
		})		
	}

	goToSearchPage(event: any) {
		this.store.dispatch(new fromApp.SelectModel(event.name));
		this.store.dispatch(new fromApp.LoadSelectedModel(event.name));
		this.store.dispatch(new fromApp.Go({path: ['/search'], query: { model: event.name}}))
	}

	openDialog(): void {
    const dialogRef = this.dialog.open(LoginDialog, {
			width: '400px',
			position: { top: '200px' },
			disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


}

@Component({
  selector: 'med-login-dialog',
	template: `
		<h1 mat-dialog-title>Welcome!</h1>
		<mat-dialog-content>
			The Model Editor requires that you
			be an authorized user to add models
			or edit documents, so please...
			<med-login class="login-btn">
			</med-login>
		</mat-dialog-content>
		<h5> No account? Please <a href="https://urs.earthdata.nasa.gov">register</a></h5>`,
	styles: [
		`
			h1, h5, mat-dialog-content {
				text-align: center;
			}	
			
			h1 {
				font-size: 24px;
			}

			.login-btn {
				display: block;
				margin: 10px 0;
			}
		`
	]
})
export class LoginDialog {

  constructor(public dialogRef: MatDialogRef<LoginDialog>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
