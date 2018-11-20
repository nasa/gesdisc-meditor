import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatIconModule, MatDialogModule, MatDialogRef } from '@angular/material';
import { LoginDialog } from './login-dialog.component';

describe('Login Component', () => {
	let fixture: ComponentFixture<LoginDialog>;
	let component: LoginDialog;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				MatIconModule,
				MatDialogModule
			],
			declarations: [ LoginDialog ],
			providers: [
				{ provide: MatDialogRef, useValue: {} }
			]
		});

		fixture = TestBed.createComponent(LoginDialog);
		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it('should compile login dialog', () => {
		expect(fixture).toMatchSnapshot();
	});
});
