import { ComponentFixture, TestBed  } from '@angular/core/testing';

import { ToolbarComponent } from './toolbar.component';
import { MatIconModule, MatToolbarModule } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ToolbarComponent', () => {
	let fixture: ComponentFixture<ToolbarComponent>;
	let instance: ToolbarComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				ToolbarComponent
			],
			imports: [
				MatIconModule,
				MatToolbarModule
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

		fixture = TestBed.createComponent(ToolbarComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should compile toolbar', () => {
		expect(fixture).toMatchSnapshot();
	});
});
