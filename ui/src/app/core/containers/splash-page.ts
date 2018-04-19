import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'med-splash-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template:
	`
		<div>
			<button mat-fab><fa size="2x" name="exclamation-triangle"></fa></button>
			<button mat-fab><fa size="2x" name="newspaper-o"></fa></button>
			<button mat-fab style="background-color: blue;"><fa size="2x" name="newspaper-o"></fa></button>
			<button mat-fab><fa size="2x" name="info"></fa></button>
			<button mat-fab style="background-color: yellow;"><fa size="2x" name="question"></fa></button>
			<button mat-fab><fa size="2x" name="image"></fa></button>
			<button mat-fab style="background-color: green;"><fa size="2x" name="wrench"></fa></button>
			<button mat-fab><fa size="2x" name="file-text"></fa></button>
		</div>
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
