import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<med-search-bar></med-search-bar>',
	styles: [
		`
		:host {
			text-align: center;
		}
	`,
	],
})
export class SearchPageContainer {
}
