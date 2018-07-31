import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocnewComponent } from './docnew.component';

describe('DocnewComponent', () => {
  let component: DocnewComponent;
  let fixture: ComponentFixture<DocnewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocnewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocnewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
