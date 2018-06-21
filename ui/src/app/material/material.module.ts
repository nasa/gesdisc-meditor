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
  MatBadgeModule
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
  	MatBadgeModule
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
  	MatBadgeModule
  ],
})
export class MaterialModule {}
