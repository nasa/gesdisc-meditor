import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchResultsComponent } from './components/search-result-list/search-result-list.component';
import { SearchPageComponent } from './containers/search-page.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SearchResultComponent } from './components/search-result/search-result.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		FlexLayoutModule
	],
	declarations: [
		SearchBarComponent,
		SearchResultsComponent,
		SearchPageComponent,
		SearchResultComponent
	],
	exports: [ SearchPageComponent ]
})
export class SearchModule {
	static forRoot() {
		return {
			ngModule: SearchModule
		};
	}
}
