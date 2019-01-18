import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { NgxsModule, Store, } from '@ngxs/store';
import { DocNewPageComponent } from './docnew-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('Document New Page', () => {
	let fixture: ComponentFixture<DocNewPageComponent>;
	let store: Store;
	let component: DocNewPageComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
        NgxsModule.forRoot()
			],
			declarations: [
				DocNewPageComponent
			],
			schemas: [ NO_ERRORS_SCHEMA ]
		});
    
		fixture = TestBed.createComponent(DocNewPageComponent);
		component = fixture.componentInstance;

   
    Object.defineProperty(component, 'userPrivileges$', { writable: true });
    component.userPrivileges$ = of(['edit']);
		store = TestBed.get(Store);
	});

	it('should compile', () => {
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});

});
