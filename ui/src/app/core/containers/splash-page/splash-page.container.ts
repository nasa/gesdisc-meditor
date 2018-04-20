import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'med-splash-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './splash-page.container.html'
	,
	styles: [
		`
		:host {
			text-align: center;
		}
	`,
	],
})
export class SplashPageContainer {}
