import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store, NgxsModule} from '@ngxs/store';
import { MatIconModule } from '@angular/material';
import { LoginStatusComponent } from './login-status.component';
import { of } from 'rxjs';

describe('Login Component', () => {
	let fixture: ComponentFixture<LoginStatusComponent>;
	let store: Store;
	let component: LoginStatusComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NgxsModule.forRoot(),
				MatIconModule
			],
			declarations: [LoginStatusComponent]
		});

		fixture = TestBed.createComponent(LoginStatusComponent);
		component = fixture.componentInstance;
		store = TestBed.get(Store);

		Object.defineProperty(component, 'user$', { writable: true });
		component.user$ = of({firstName: 'testName'});
		fixture.detectChanges();
	});

	it('should compile login status component', () => {
		expect(fixture).toMatchSnapshot();
	});

	it('userBtn should be true on init and should toggle userBtn status on toggleButton()', () => {
		expect(component.userBtn).toBeTruthy();
		component.toggleButton();
		expect(component.userBtn).toBeFalsy();
	});
});
