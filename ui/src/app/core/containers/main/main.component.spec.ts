import { ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { MainComponent } from './main.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as fromRoot from '../../../reducers';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as Model from '../../actions/model.actions';

describe('Main Page', () => {
	let fixture: ComponentFixture<MainComponent>;
	let store: Store<fromRoot.State>;
	let instance: MainComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				StoreModule.forRoot({
					models: combineReducers(fromRoot.reducers),
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

	it('should dispatch a Model.Load on init', () => {
    const action = new Model.Load();

    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(action);
  });

});
