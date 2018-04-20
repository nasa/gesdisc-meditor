import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashPageContainer } from './splash-page.container';

describe('MyNewComponentComponent', () => {
  let component: SplashPageContainer;
  let fixture: ComponentFixture<SplashPageContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplashPageContainer ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashPageContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
