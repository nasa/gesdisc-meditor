import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchResultListComponent } from './search-result-list.component';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SearchResultListComponent', () => {
	let fixture: ComponentFixture<SearchResultListComponent>;
	let instance: SearchResultListComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
			],
			declarations: [
				SearchResultListComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

		fixture = TestBed.createComponent(SearchResultListComponent);
		instance = fixture.componentInstance;

	});

	describe('with no data', () => {
		it('should not have any initial input', () => {
			expect(instance.results).toBeUndefined();
		});
	});

	describe('with mock data', () => {

		it('should compile with minimum input (have 2 med-search-result elements)', () => {
			instance.results = [
				{ title: 'test title',
					'x-meditor': {
						modifiedOn: '2018-05-04T19:09:05.366Z',
						modifiedBy: 'test author'
					}
				},
				{ title: 'test title2',
					'x-meditor': {
						modifiedOn: '2018-05-06T19:09:05.366Z',
						modifiedBy: 'test author2'
					}
				}
			]
			fixture.detectChanges();
			expect(fixture).toMatchSnapshot();
		});
	});
});
