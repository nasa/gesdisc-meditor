import { ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { SplashPageComponent } from './splash-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { ModelButtonComponent } from '../components/model-button/model-button.component';
import * as Model from '../actions/model.actions';
import * as fromRoot from '../../reducers';

describe('Splash Page', () => {
  let fixture: ComponentFixture<SplashPageComponent>;
  let store: Store<fromRoot.State>;
  let instance: SplashPageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        StoreModule.forRoot({
          models: combineReducers(fromRoot.reducers),
        }),
        MatCardModule,
        MatButtonModule,
        RouterTestingModule
      ],
      declarations: [
        SplashPageComponent,
        ModelButtonComponent
      ],
    });

    fixture = TestBed.createComponent(SplashPageComponent);
    instance = fixture.componentInstance;
    store = TestBed.get(Store);

    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should compile', () => {
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
