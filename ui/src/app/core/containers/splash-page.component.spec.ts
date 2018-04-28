import { ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { SplashPageComponent } from './splash-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { ContentTypeButtonComponent } from '../components/content-type-button/content-type-button.component';
import * as fromContentTypes from '../../reducers';

describe('Splash Page', () => {
  let fixture: ComponentFixture<SplashPageComponent>;
  let store: Store<fromContentTypes.State>;
  let instance: SplashPageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        StoreModule.forRoot({
          contentTypes: combineReducers(fromContentTypes.reducers),
        }),
        MatCardModule,
        MatButtonModule,
        RouterTestingModule
      ],
      declarations: [
        SplashPageComponent,
        ContentTypeButtonComponent
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
