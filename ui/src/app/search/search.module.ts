import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchResultListComponent } from './components/search-result-list/search-result-list.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { SearchPageComponent } from './containers/search-page.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { StoreModule } from '@ngrx/store';

import { reducer } from './reducers/results.reducer';

import { EffectsModule } from '@ngrx/effects';
import { ResultEffects } from './effects/result.effects';
import { SearchStatusComponent } from './components/search-status/search-status.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		FlexLayoutModule,
		StoreModule.forFeature('results', reducer),
		EffectsModule.forFeature([ResultEffects]),
	],
	declarations: [
		SearchBarComponent,
		SearchResultListComponent,
		SearchPageComponent,
		SearchResultComponent,
		SearchStatusComponent
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
