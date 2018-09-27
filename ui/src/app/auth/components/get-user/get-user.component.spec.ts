import { ComponentFixture, TestBed, ComponentFixtureAutoDetect} from '@angular/core/testing';
import { Store, NgxsModule } from '@ngxs/store';
import { GetUserComponent } from './get-user.component';

describe('GetUserComponent', () => {
	let component: GetUserComponent;
	let fixture: ComponentFixture<GetUserComponent>;
	let store: Store;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NgxsModule.forRoot()
			],
			declarations: [ GetUserComponent ],
			providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
		});

		const initialState = {};
		fixture = TestBed.createComponent(GetUserComponent);
		component = fixture.componentInstance;
		store = TestBed.get(Store);
		store.reset(initialState);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(fixture).toMatchSnapshot();
	});
});
