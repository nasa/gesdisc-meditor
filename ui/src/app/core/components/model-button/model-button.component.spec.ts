import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { ModelButtonComponent } from './model-button.component';

describe('Model Button Component', () => {
	let fixture: ComponentFixture<ModelButtonComponent>;
	let instance: ModelButtonComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				MatCardModule,
				MatButtonModule
			],
			declarations: [
				ModelButtonComponent
			]
		});

		fixture = TestBed.createComponent(ModelButtonComponent);
		instance = fixture.componentInstance;
		instance.model = {
			name: 'test',
			description: 'test'
		}
	});

	it('should compile', () => {
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});

});
