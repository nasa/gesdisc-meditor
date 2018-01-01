import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NgxsModule, Store, } from '@ngxs/store';
import { SearchPageComponent } from './search-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Search Page', () => {
	let fixture: ComponentFixture<SearchPageComponent>;
	let store: Store;
	let component: SearchPageComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
        NgxsModule.forRoot()
			],
			declarations: [
				SearchPageComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

		fixture = TestBed.createComponent(SearchPageComponent);
		component = fixture.componentInstance;
		store = TestBed.get(Store);
	});

	it('should compile', () => {
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});

});
