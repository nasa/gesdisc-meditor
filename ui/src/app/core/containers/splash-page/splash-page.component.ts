import { Component, OnInit } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';
//import { Model } from '../../../service/model/model';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';

//import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import * as fromApp from '../../../store';
import * as fromAuth from '../../../auth/store';

@Component({
	selector: 'med-splash-page',
	templateUrl: './splash-page.component.html',
	styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent implements OnInit{

	models$: Observable<ModelCatalogEntry[]>;
	currentModel$: Observable<string>;
	categories$: Observable<string[]>;
	loggedIn$: Observable<boolean>;
	modelName: string;

	constructor(
		//public dialog: MatDialog,
		private store: Store<fromApp.AppState>
	) {
		this.models$ = store.pipe(select(fromApp.getAllModels));
		this.categories$ = store.pipe(select(fromApp.getCategories));
		this.loggedIn$ = store.pipe(select(fromAuth.getLoggedIn));
		this.currentModel$ = store.pipe(select(fromApp.getCurrentModelId));
	}

	ngOnInit () {	
		localStorage.clear();		
		// this.store.dispatch(new fromApp.LoadModels());		
		this.loggedIn$.subscribe(status => {
			if (!status) { 
				this.store.dispatch(new fromAuth.GetUser());
			} 
		})		
		this.currentModel$.subscribe(model => { 
			this.modelName = model;
		})
	}

	goToSearchPage(event: any) {		
		if (this.modelName !== event.name) {
			this.store.dispatch(new fromApp.SelectModel(event.name));
			this.store.dispatch(new fromApp.LoadSelectedModel(event.name));
		}
		this.store.dispatch(new fromApp.Go({path: ['/search'], query: { model: event.name}}))
	}

	// openDialog(): void {
  //   this.dialog.open(LoginDialog, {
	// 		width: '400px',
	// 		position: { top: '200px' },
	// 		disableClose: true
  //   });
	// }

	// closeDialog(): void {
  //   this.dialog.closeAll();
	// }

}

//TODO: Move this to separate file.

// @Component({
//   selector: 'med-login-dialog',
// 	template: `
// 		<h1 mat-dialog-title>Welcome!</h1>
// 		<mat-dialog-content>
// 			The Model Editor requires that you
// 			be an authorized user to add models
// 			or edit documents, so please...
// 			<med-login class="login-btn">
// 			</med-login>
// 		</mat-dialog-content>
// 		<h5> No account? Please <a href="https://urs.earthdata.nasa.gov">register</a></h5>`,
// 	styles: [
// 		`
// 			h1, h5, mat-dialog-content {
// 				text-align: center;
// 			}	
			
// 			h1 {
// 				font-size: 24px;
// 			}

// 			.login-btn {
// 				display: block;
// 				margin: 10px 0;
// 			}
// 		`
// 	]
// })
// export class LoginDialog {

//   constructor(public dialogRef: MatDialogRef<LoginDialog>) {}

//   closeDialog(): void {
//     this.dialogRef.close();
//   }

// }
