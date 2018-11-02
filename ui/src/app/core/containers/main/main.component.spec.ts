import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Main Page', () => {
	let fixture: ComponentFixture<MainComponent>;
	let instance: MainComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule
			],
			declarations: [
				MainComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

		fixture = TestBed.createComponent(MainComponent);
		instance = fixture.componentInstance;
	});

	it('should compile main container', () => {
		fixture.detectChanges();

		expect(fixture).toMatchSnapshot();
	});

});
