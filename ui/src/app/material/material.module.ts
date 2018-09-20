import { NgModule } from '@angular/core';

import {
	MatInputModule,
	MatCardModule,
	MatButtonModule,
	MatSidenavModule,
	MatListModule,
	MatIconModule,
	MatToolbarModule,
	MatProgressSpinnerModule,
	MatDatepickerModule,
	MatCheckboxModule,
	MatSelectModule,
	MatSnackBarModule,
	MatBadgeModule,
	MatDialogModule,
	MatChipsModule
} from '@angular/material';

@NgModule({
	imports: [
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatSidenavModule,
		MatListModule,
		MatIconModule,
		MatToolbarModule,
		MatProgressSpinnerModule,
		MatDatepickerModule,
		MatCheckboxModule,
		MatSelectModule,
		MatSnackBarModule,
		MatBadgeModule,
		MatDialogModule,
		MatChipsModule
	],
	exports: [
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatSidenavModule,
		MatListModule,
		MatIconModule,
		MatToolbarModule,
		MatProgressSpinnerModule,
		MatDatepickerModule,
		MatCheckboxModule,
		MatSelectModule,
		MatSnackBarModule,
		MatBadgeModule,
		MatDialogModule,
		MatChipsModule
	],
})
export class MaterialModule {}
