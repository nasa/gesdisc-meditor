import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchResultListComponent } from './components/search-result-list/search-result-list.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { SearchPageComponent } from './containers/search-page.component';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SearchStatusComponent } from './components/search-status/search-status.component';
import { routes } from './search.routing';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		FlexLayoutModule,
		RouterModule.forChild(routes),
	],
	declarations: [
		SearchBarComponent,
		SearchResultListComponent,
		SearchPageComponent,
		SearchResultComponent,
		SearchStatusComponent
	],
	entryComponents: [ SearchPageComponent ]
})
export class SearchModule {
}
