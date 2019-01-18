import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NgxsModule, Store, } from '@ngxs/store';
import { DocEditPageComponent } from './docedit-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('Document Edit Page', () => {
	let fixture: ComponentFixture<DocEditPageComponent>;
	let store: Store;
	let component: DocEditPageComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
        NgxsModule.forRoot()
			],
			declarations: [
				DocEditPageComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});

		fixture = TestBed.createComponent(DocEditPageComponent);
		component = fixture.componentInstance;

    Object.defineProperty(component, 'userPrivileges$', { writable: true });
    Object.defineProperty(component, 'document$', { writable: true });
    component.userPrivileges$ = of(['edit']);
    component.document$ = of({'x-meditor': {'targetStates': ['Draft', 'Under Review']}});
		fixture.detectChanges();
    
		store = TestBed.get(Store);
	});

	it('should compile', () => {
		expect(fixture).toMatchSnapshot();
	});

});
