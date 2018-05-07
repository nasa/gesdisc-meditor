import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatIconModule, MatButtonModule } from '@angular/material';
import { ModelButtonComponent } from './model-button.component';

describe('ModelButtonComponent', () => {
	let fixture: ComponentFixture<ModelButtonComponent>;
	let instance: ModelButtonComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				MatCardModule,
				MatButtonModule,
				MatIconModule
			],
			declarations: [
				ModelButtonComponent
			]
		});

		fixture = TestBed.createComponent(ModelButtonComponent);
		instance = fixture.componentInstance;

	});

	describe('with no data', () => {

		

		it('should throw an error when when compiled', () => {
			expect(function() { fixture.detectChanges() }).toThrow(new TypeError("Cannot read property 'icon' of undefined"));
		});

		it('should not have any initial input', () => {
			expect(instance.model).toBeUndefined();
		});
	});

	describe('with mock data', () => {

		it('should compile with minimum input (model has "name" and "description")', () => {
			instance.model = {
				name: 'test',
				description: 'test'
			}
			fixture.detectChanges();
			expect(fixture).toMatchSnapshot();
		});
	
		it('should compile minimum input + icon', () => {
			instance.model = {
				name: 'test',
				description: 'test',
				icon: {
					name: 'fa-warning',
					color: '#AF4873'
				}
			};
			fixture.detectChanges();
			expect(fixture).toMatchSnapshot();
		});
	});
});
