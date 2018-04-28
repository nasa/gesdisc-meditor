import { ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { MainComponent } from './main';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as fromContentTypes from '../../reducers';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as ContentTypes from '../actions/content-types';

describe('Main Page', () => {
	let fixture: ComponentFixture<MainComponent>;
	let store: Store<fromContentTypes.State>;
	let instance: MainComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				StoreModule.forRoot({
					contentTypes: combineReducers(fromContentTypes.reducers),
				})
			],
			declarations: [
				MainComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

		fixture = TestBed.createComponent(MainComponent);
		instance = fixture.componentInstance;
		store = TestBed.get(Store);

		spyOn(store, 'dispatch').and.callThrough();
	});

	it('should compile', () => {
		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});

	it('should dispatch a ContentTypes.LoadContentTypes on init', () => {
    const action = new ContentTypes.LoadContentTypes();

    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

});
