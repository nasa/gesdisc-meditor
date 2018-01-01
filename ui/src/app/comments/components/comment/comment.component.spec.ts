import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatIconModule, MatInputModule } from '@angular/material';

import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        NoopAnimationsModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatInputModule
      ],
      declarations: [ CommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('should create comment thread with mock data', () => {
    component.tree = true;
    component.comments = 
      [
        {
          _id: '5bc9fed4e7cd1d776e763685',
          text: 'test',
          resolved: false,
          parentId: 'root',
          documentId: 'test',
          model: 'Image',
          createdBy: 'Test',
          createdOn: '2018-10-19T15:57:08.084Z'
        },
        {
          _id: '5bca04bace5e5478ac9c985f',
          text: 'image comment',
          resolved: false,
          parentId: 'root',
          documentId: 'test',
          model: 'Image',
          createdBy: 'Test',
          createdOn: '2018-10-19T16:22:18.565Z'
        },
        {
          _id: '5bcf41e2e59cd2e18508b1e7',
          text: 'wow another reply here',
          resolved: false,
          parentId: '5bc9fed4e7cd1d776e763685',
          documentId: 'test',
          model: 'Image',
          createdBy: 'Test',
          createdOn: '2018-10-23T15:44:34.601Z'
        },
        {
          _id: '5bcf4208e59cd2e18508b1e8',
          text: 'another important reply',
          resolved: false,
          parentId: '5bc9fed4e7cd1d776e763685',
          documentId: 'test',
          model: 'Image',
          createdBy: 'Test',
          createdOn: '2018-10-23T15:45:12.535Z'
        },
        {
          _id: '5bcf421be59cd2e18508b1e9',
          text: 'hey topic starter, pay attention to this please',
          resolved: false,
          parentId: '5bc9fed4e7cd1d776e763685',
          documentId: 'test',
          model: 'Image',
          createdBy: 'Test',
          createdOn: '2018-10-23T15:45:31.108Z'
        }
      ]
    
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
