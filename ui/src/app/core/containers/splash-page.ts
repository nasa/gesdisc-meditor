import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'med-splash-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div>it works!</div>
	`
	// TODO: Create component and add it to template
	// <med-content-type></med-content-type>

	,
	styles: [
		`
		:host {
			text-align: center;
		}
	`,
	],
})
export class SplashPageComponent {}
