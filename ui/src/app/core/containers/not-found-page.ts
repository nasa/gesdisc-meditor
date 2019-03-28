import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Title }     from '@angular/platform-browser';

@Component({
  selector: 'med-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-title>404: Not Found</mat-card-title>
      <mat-card-content>
        <p>Hey! It looks like this page doesn't exist yet.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" routerLink="/">Home page</button>
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
export class NotFoundPageComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Page not found | mEditor');
  }
}
