import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SearchPageContainer } from './containers/search-page.container';
import { MaterialModule } from '../material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [
 		SearchBarComponent,
 		SearchResultsComponent,
 		SearchPageContainer
 	],
  exports: [ SearchPageContainer ]
})
export class SearchModule {
	static forRoot() {
    return {
      ngModule: SearchModule
    };
  }
}
