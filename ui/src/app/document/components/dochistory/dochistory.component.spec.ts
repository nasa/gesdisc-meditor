import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DochistoryComponent } from './dochistory.component';

describe('DochistoryComponent', () => {
  let component: DochistoryComponent;
  let fixture: ComponentFixture<DochistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DochistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DochistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
