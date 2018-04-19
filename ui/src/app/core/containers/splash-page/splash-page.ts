import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'med-splash-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	// template: `
	// 	<div>
	// 		<button mat-fab><mat-icon>warning</mat-icon></button>
	// 		<button mat-fab><mat-icon>description</mat-icon></button>
	// 		<button mat-fab><mat-icon>build</mat-icon></button>
	// 		<button mat-fab><mat-icon>image</mat-icon></button>
	// 		<button mat-fab><mat-icon>info</mat-icon></button>
	// 		<button mat-fab><mat-icon>help</mat-icon></button>
	// 	</div>

	// 	<div>
	// 		<button mat-fab><fa size="2x" name="exclamation-triangle"></fa></button>
	// 		<button mat-fab><fa size="2x" name="newspaper-o"></fa></button>
	// 		<button mat-fab style="background-color: blue;"><fa size="2x" name="newspaper-o"></fa></button>
	// 		<button mat-fab><fa size="2x" name="info"></fa></button>
	// 		<button mat-fab style="background-color: yellow;"><fa size="2x" name="question"></fa></button>
	// 		<button mat-fab><fa size="2x" name="image"></fa></button>
	// 		<button mat-fab style="background-color: green;"><fa size="2x" name="wrench"></fa></button>
	// 		<button mat-fab><fa size="2x" name="file-text"></fa></button>
	// 	</div>
	// `
	
	templateUrl: './splash-page.html'
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
