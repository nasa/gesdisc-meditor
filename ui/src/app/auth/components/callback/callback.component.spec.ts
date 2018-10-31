import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule  } from '@angular/router/testing';

import { CallbackComponent } from './callback.component';

describe('CallbackComponent', () => {
	let component: CallbackComponent;
	let fixture: ComponentFixture<CallbackComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ RouterTestingModule ],
			declarations: [ CallbackComponent ]
		});

		fixture = TestBed.createComponent(CallbackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create callback component', () => {
		expect(fixture).toMatchSnapshot();
	});
});
