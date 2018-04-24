import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SplashPageContainer } from './splash-page.container';
import { SplashBoxComponent } from '../../components/splash-box/splash-box.component';
import { MaterialModule } from '../../../material';
import { ContentTypeButtonComponent } from '../../components/content-type-button/content-type-button.component';
import { ContentTypeService } from '../../services/content-type/content-type.service';
import { HttpClientModule } from '@angular/common/http';

xdescribe('SplashPageContainer', () => {
  let component: SplashPageContainer;
  let fixture: ComponentFixture<SplashPageContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplashBoxComponent, SplashPageContainer, ContentTypeButtonComponent ],
      imports: [ HttpClientModule, MaterialModule ],
      providers: [ ContentTypeService ]
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
