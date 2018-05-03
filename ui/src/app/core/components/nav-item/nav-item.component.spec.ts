import { ComponentFixture, TestBed  } from '@angular/core/testing';

import { NavItemComponent } from './nav-item.component';
import { SplashPageComponent } from '../../containers/splash-page/splash-page.component';
import { SearchPageComponent } from '../../../search/containers/search-page.component';
import { NotFoundPageComponent } from '../../containers/not-found-page';

import { APP_BASE_HREF } from '@angular/common';
import { MatIconModule } from '@angular/material';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from '../../../routes';

describe('NavItemComponent', () => {
	let fixture: ComponentFixture<NavItemComponent>;
	let instance: NavItemComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				NavItemComponent,
				NotFoundPageComponent,
				SearchPageComponent,
				SplashPageComponent
			],
			imports: [ 
				MatIconModule,
				RouterModule.forRoot(routes)
			],
			providers: [ {provide: APP_BASE_HREF, useValue: '/' }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
		});

		fixture = TestBed.createComponent(NavItemComponent);
		instance = fixture.componentInstance;
	});

	it('should compile', () => {
    fixture.detectChanges();
    expect(instance).toBeDefined();
  });
});