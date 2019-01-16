import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxsModule, Store, } from '@ngxs/store';
import { of } from 'rxjs';

describe('Main Page', () => {
	let fixture: ComponentFixture<MainComponent>;
	let component: MainComponent;
  let store: Store;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
        NgxsModule.forRoot(),
			],
			declarations: [
				MainComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

    const initialState = {
			auth: {
				loggedIn: false
			}
		};

		fixture = TestBed.createComponent(MainComponent);
		component = fixture.componentInstance;

    Object.defineProperty(component, 'loggedIn$', { writable: true });
		component.loggedIn$ = of(initialState.auth.loggedIn);

    store = TestBed.get(Store);
		store.reset(initialState);

		spyOn(component, 'keepAlive').and.callThrough();

		fixture.detectChanges();
	});

	it('should compile main container and call keepAlive', () => {
		expect(fixture).toMatchSnapshot();
    component.ngOnInit();
		expect(component.keepAlive).toHaveBeenCalled();
	});

});
