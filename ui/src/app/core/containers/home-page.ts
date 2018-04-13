import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'med-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-title>Hey buddy!</mat-card-title>
      <mat-card-content>
        Looks like you just logged in
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" routerLink="/">Take Me Home</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
    :host {
      text-align: center;
    }
  `,
  ],
})
export class HomePageComponent {}
