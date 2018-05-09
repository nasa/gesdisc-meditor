import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchResultComponent } from './search-result.component';

describe('SearchResultComponent', () => {
	let fixture: ComponentFixture<SearchResultComponent>;
	let instance: SearchResultComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
			],
			declarations: [
				SearchResultComponent
			]
		});

		fixture = TestBed.createComponent(SearchResultComponent);
		instance = fixture.componentInstance;

	});

	describe('with no data', () => {
		it('should not have any initial input', () => {
			expect(instance.result).toBeUndefined();
		});
	});

	describe('with mock data', () => {

		it('should compile with minimum input', () => {
			instance.result = {
				title: 'test title',
				'x-meditor': {
					modifiedOn: '2018-05-04T19:09:05.366Z',
					modifiedBy: 'test author'
				}
			}
			fixture.detectChanges();
			expect(fixture).toMatchSnapshot();
		});
	});
});
