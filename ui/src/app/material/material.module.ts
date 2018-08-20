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
  MatDialogModule
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
    MatDialogModule
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
    MatDialogModule
  ],
})
export class MaterialModule {}
