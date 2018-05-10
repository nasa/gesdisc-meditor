import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { RouterTestingModule,  } from "@angular/router/testing";
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { SplashPageComponent } from './splash-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { ModelButtonComponent } from '../../components/model-button/model-button.component';

import * as fromRoot from '../../../reducers';
import * as Model from '../../../core/actions/model.actions';

describe('Search Page', () => {
	let fixture: ComponentFixture<SplashPageComponent>;
	let store: Store<fromRoot.State>;
	let instance: SplashPageComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				RouterTestingModule,
				StoreModule.forRoot({
					models: combineReducers(fromRoot.reducers),
				}),
				MatCardModule,
				MatButtonModule
			],
			declarations: [
				SplashPageComponent,
				ModelButtonComponent
			]
		});

		fixture = TestBed.createComponent(SplashPageComponent);
		instance = fixture.componentInstance;
		store = TestBed.get(Store);

		spyOn(store, 'dispatch').and.callThrough();
	});

	it('should compile', () => {
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});



});
