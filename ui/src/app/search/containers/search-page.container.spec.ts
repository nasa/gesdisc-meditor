import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPageContainer } from './search-page.container';
import { SearchBarComponent } from '../components/search-bar/search-bar.component'

import { MaterialModule } from '../../material';
import { HttpClientModule } from '@angular/common/http';

describe('SearchPageContainer', () => {
  let component: SearchPageContainer;
  let fixture: ComponentFixture<SearchPageContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPageContainer, SearchBarComponent ],
      imports: [ HttpClientModule, MaterialModule ],
      providers: [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
