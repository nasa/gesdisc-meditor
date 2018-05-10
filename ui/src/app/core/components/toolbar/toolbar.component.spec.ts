import { ComponentFixture, TestBed  } from '@angular/core/testing';

import { ToolbarComponent } from './toolbar.component';
import { LoginComponent } from '../../../auth/components/login.component';

import * as fromRoot from '../../../reducers';
import { MatIconModule, MatToolbarModule } from '@angular/material';
import { combineReducers, Store, StoreModule } from '@ngrx/store';


describe('ToolbarComponent', () => {
	let fixture: ComponentFixture<ToolbarComponent>;
	let instance: ToolbarComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
        ToolbarComponent,
        LoginComponent
      ],
      imports: [
        MatIconModule, 
        MatToolbarModule,
        StoreModule.forRoot({
					models: combineReducers(fromRoot.reducers),
				})
      ]
		});

		fixture = TestBed.createComponent(ToolbarComponent);
    instance = fixture.componentInstance;
    fixture.detectChanges();
	});

  it('should compile', () => {
    expect(instance).toBeDefined();
  });
});
