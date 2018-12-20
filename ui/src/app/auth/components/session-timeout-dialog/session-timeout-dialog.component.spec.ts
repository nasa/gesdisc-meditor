import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatIconModule, MatDialogModule, MatDialogRef } from '@angular/material';
import { SessionTimeoutDialog } from './session-timeout-dialog.component';

describe('SessionTimeoutDialog Component', () => {
	let fixture: ComponentFixture<SessionTimeoutDialog>;
	let component: SessionTimeoutDialog;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				MatIconModule,
				MatDialogModule
			],
			declarations: [ SessionTimeoutDialog ],
			providers: [
				{ provide: MatDialogRef, useValue: {} }
			]
		});

		fixture = TestBed.createComponent(SessionTimeoutDialog);
		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it('should compile session timeout dialog', () => {
		expect(fixture).toMatchSnapshot();
	});
});
