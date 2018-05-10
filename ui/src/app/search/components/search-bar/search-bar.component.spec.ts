import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule, MatIconModule, MatInputModule } from '@angular/material';
import { SearchBarComponent } from './search-bar.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('SearchBarComponent', () => {
	let fixture: ComponentFixture<SearchBarComponent>;
	let instance: SearchBarComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				FormsModule,
				ReactiveFormsModule,
				NoopAnimationsModule,
				MatSelectModule,
				MatInputModule,
				MatIconModule
			],
			declarations: [
				SearchBarComponent
			]
		});

		fixture = TestBed.createComponent(SearchBarComponent);
		instance = fixture.componentInstance;

	});

	describe('with no data', () => {
		it('should not have any initial input', () => {
			expect(instance.models).toBeUndefined();
			expect(instance.selectedModel).toBeUndefined();
		});
	});

	describe('with mock data', () => {

		it('should compile with minimum input', () => {
			instance.models = [
				{
					name: 'test',
					description: 'test'
				},
				{
					name: 'test1',
					description: 'test1'
				}
			]
			instance.selectedModel = {
				name: 'test',
				description: 'test'
			}
			fixture.detectChanges();
			expect(fixture).toMatchSnapshot();
		});
	});
});
