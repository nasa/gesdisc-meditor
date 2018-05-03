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

	});

	it('should compile', () => {
		instance.model = {
			name: 'test',
			description: 'test'
		}
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});

	it('should compile with icon', () => {
		instance.model = {
			name: 'test',
			description: 'test',
			icon: {
        name: 'fa-warning',
        color: '#AF4873'
      }
	}
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});

});
// =======
// import { Component, DebugElement, Input } from '@angular/core';
// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { ModelButtonComponent } from './model-button.component';

// import { AngularFontAwesomeModule } from 'angular-font-awesome';
// import { MaterialModule } from '../../../material';
// import { MatButtonModule } from '@angular/material/button'
// import { FlexLayoutModule } from '@angular/flex-layout';

// describe('ModelButtonComponent', () => {
//   let component: ModelButtonComponent;
//   let fixture: ComponentFixture<ModelButtonComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ ModelButtonComponent ],
//       imports: [MatButtonModule, MaterialModule, FlexLayoutModule, AngularFontAwesomeModule]
//     })
//     .compileComponents();
//   }));

//   describe('with no data', () => {

//     beforeEach(() => {
//       fixture = TestBed.createComponent(ModelButtonComponent);
//       component = fixture.debugElement.componentInstance;
//       fixture.detectChanges();
//     });

//     it('should create', () => {
//       expect(component).toBeDefined();
//     });

//     it('should not have any initial input', () => {
//       expect(component.model).toBeUndefined();
//     });

//     it('should not have any initial DOM', () => {
//       const contentTypeButtonElement: HTMLElement = fixture.nativeElement;
//       expect(contentTypeButtonElement.innerHTML).toEqual('<!--bindings={}-->');
//     });
//   });

//   xdescribe('with mock data', () => {

//     beforeEach(() => {
//       fixture = TestBed.createComponent(ModelButtonComponent);
//       component = fixture.debugElement.componentInstance;
//       component.model = {
//           name: 'XYZ',
//           description: 'mock data description',
//           icon: {
//             name: 'fa-warning',
//             color: '#AF4873'
//           }
//         };
//       fixture.detectChanges();
//     });

//     it('should create', () => {
//       expect(component).toBeDefined();
//     });

//     it('should have input', () => {
//       expect(component.model).toBeDefined();
//     });

//     it('should have DOM', () => {
//       expect(fixture.nativeElement).not.toEqual('<!--bindings={}-->');
//     });

//     describe('DOM', () => {


//     });
//   });
// });
// >>>>>>> babd9da6a1637d1f95adc7bb560ad0730a99327e
