import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatIconModule } from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { DochistoryComponent } from './dochistory.component';

describe('DochistoryComponent', () => {
  let component: DochistoryComponent;
  let fixture: ComponentFixture<DochistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        NoopAnimationsModule,
        FormsModule,
        ScrollingModule,
        MatCardModule,
        MatIconModule
      ],
      declarations: [ DochistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DochistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create version list with mock data', () => {
    component.selectedHistory = '2018-10-29T18:00:09.424Z'
    
    component.dochistory = [
      {
        modifiedOn: new Date('2018-10-29T18:00:09.424Z'),
        modifiedBy: 'azasorin'
      },
      {
        modifiedOn: new Date('2018-10-29T18:00:04.422Z'),
        modifiedBy: 'azasorin'
      },
      {
        modifiedOn: new Date('2018-10-29T18:00:01.380Z'),
        modifiedBy: 'azasorin'
      }
    ]
    
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
