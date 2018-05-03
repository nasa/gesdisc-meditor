import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultListComponent } from './search-result-list.component';
import { SearchResultComponent } from '../search-result/search-result.component';

describe('SearchResultsComponent', () => {
  let component: SearchResultListComponent;
  let fixture: ComponentFixture<SearchResultListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultListComponent, SearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
