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
	MatChipsModule,
  MatMenuModule
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
		MatChipsModule,
    MatMenuModule
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
		MatChipsModule,
    MatMenuModule
	],
})
export class MaterialModule {}
