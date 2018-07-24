import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { RouterTestingModule,  } from "@angular/router/testing";
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { SearchPageComponent } from './search-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as fromRoot from '../../reducers';
import * as Model from '../../core/actions/model.actions';
import * as Results from '../actions/result.actions';

describe('Search Page', () => {
	let fixture: ComponentFixture<SearchPageComponent>;
	let store: Store<fromRoot.State>;
	let instance: SearchPageComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				RouterTestingModule,
				StoreModule.forRoot({
					models: combineReducers(fromRoot.reducers),
				})
			],
			declarations: [
				SearchPageComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

		fixture = TestBed.createComponent(SearchPageComponent);
		instance = fixture.componentInstance;
		store = TestBed.get(Store);

		spyOn(store, 'dispatch').and.callThrough();
	});

	it('should compile', () => {
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});

	// TO DO Find a a proper way to test ngOnInit with queryparams

  it('should dispatch a Model.SelectModel on init', () => {
    const selectAction = new Model.SelectModel('test');

    instance.selectModel('test');

    expect(store.dispatch).toHaveBeenCalledWith(selectAction);
  });

  it('should dispatch a Results.Search on init', () => {
    const searchAction = new Results.Search('test');

    instance.loadSearchResults('test');

    expect(store.dispatch).toHaveBeenCalledWith(searchAction);
  });

});
