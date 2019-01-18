import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchResultComponent } from './search-result.component';
import { MatChipsModule } from '@angular/material';
import { PipesModule } from '../../../shared/pipes';

describe('SearchResultComponent', () => {
	let fixture: ComponentFixture<SearchResultComponent>;
	let component: SearchResultComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
        MatChipsModule,
        PipesModule
			],
			declarations: [
				SearchResultComponent
			]
		});

		fixture = TestBed.createComponent(SearchResultComponent);
		component = fixture.componentInstance;

	});

	describe('with no data', () => {
		it('should not have any initial input', () => {
			expect(component.result).toBeUndefined();
		});
	});

	describe('with mock data', () => {

		it('should compile with minimum input', () => {
			component.result = {
				title: 'test title',
				'x-meditor': {
					modifiedOn: '2018-05-04T19:09:05.366Z',
					modifiedBy: 'test author',
          state: 'Draft'
				}
			}
			component.model = {
				name: 'test name',
				description: 'test description'
			}

      spyOn(component.loadDocument, 'emit');

      let nativeElement = fixture.nativeElement;
      let doclink = nativeElement.querySelector('a');
      doclink.dispatchEvent(new Event('click'));

			fixture.detectChanges();
			expect(fixture).toMatchSnapshot();
      expect(component.loadDocument.emit).toHaveBeenCalledWith(
        {title: component.result.title, state: component.result['x-meditor'].state}
      );
		});
	});
});
