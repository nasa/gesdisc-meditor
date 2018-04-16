import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'med-splash-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<med-content-type></med-content-type>
	`,
	styles: [
		`
		:host {
			text-align: center;
		}
	`,
	],
})
export class SplashPageComponent {}
