import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocactionsComponent } from './docactions.component';

describe('DocactionsComponent', () => {
  let component: DocactionsComponent;
  let fixture: ComponentFixture<DocactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
