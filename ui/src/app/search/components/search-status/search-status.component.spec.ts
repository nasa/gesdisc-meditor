import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchStatusComponent } from './search-status.component';
import { MatSelectModule, MatButtonModule, MatIconModule } from '@angular/material';

describe('SearchStatusComponent', () => {
	let fixture: ComponentFixture<SearchStatusComponent>;
	let instance: SearchStatusComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				MatSelectModule,
				MatButtonModule,
				MatIconModule
			],
			declarations: [
				SearchStatusComponent
			]
		});

		fixture = TestBed.createComponent(SearchStatusComponent);
		instance = fixture.componentInstance;

	});

	describe('with no data', () => {
		it('should not have any initial input, should have sortBy set default to newest', () => {
			expect(instance.filteredCount).toBeUndefined();
			expect(instance.resultCount).toBeUndefined();
			expect(instance.modelName).toBeUndefined();
			expect(instance.sortBy).toEqual('newest');
		});
	});

	describe('with mock data', () => {

		it('should compile with minimum input', () => {
			instance.filteredCount = 10;
			instance.resultCount = 15;
			instance.modelName = 'test';
			instance.sortBy = 'oldest';
      instance.privileges = ['create'];
      instance.actions = [{
        label: 'Add new'
      }];
			fixture.detectChanges();
			expect(fixture).toMatchSnapshot();
      instance.privileges = [];
			fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
		});
	});
});
