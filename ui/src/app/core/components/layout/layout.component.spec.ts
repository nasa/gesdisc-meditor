import { ComponentFixture, TestBed  } from '@angular/core/testing';

import { LayoutComponent } from './layout.component';

import { MatSidenavModule } from '@angular/material';

describe('LayoutComponent', () => {
	let fixture: ComponentFixture<LayoutComponent>;
	let instance: LayoutComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				LayoutComponent
      ],
      imports: [
        MatSidenavModule
      ]
		});

		fixture = TestBed.createComponent(LayoutComponent);
		instance = fixture.componentInstance;
	});

	it('should compile', () => {
    fixture.detectChanges();
    expect(instance).toBeDefined();
  });
});