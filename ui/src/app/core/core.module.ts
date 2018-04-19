import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MainComponent } from './containers/main';
import { NotFoundPageComponent } from './containers/not-found-page';
import { SplashPageComponent } from './containers/splash-page/splash-page';
import { ContentTypeBoxComponent } from './components/content-type-button/content-type-button';
import { ContentTypeSplashComponent } from './components/splash-box/splash-box';
import { LayoutComponent } from './components/layout';
import { NavItemComponent } from './components/nav-item';
import { SidenavComponent } from './components/sidenav';
import { ToolbarComponent } from './components/toolbar';
import { MaterialModule } from '../material';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AuthModule } from '../auth/auth.module';

export const COMPONENTS = [
  MainComponent,
  NotFoundPageComponent,
  SplashPageComponent,
  ContentTypeBoxComponent,
  ContentTypeSplashComponent,
  LayoutComponent,
  NavItemComponent,
  SidenavComponent,
  ToolbarComponent,
];

@NgModule({
  imports: [CommonModule, RouterModule, MaterialModule, FlexLayoutModule, AngularFontAwesomeModule, AuthModule.forRoot()],
  declarations: COMPONENTS,
  exports: COMPONENTS
})

export class CoreModule {
  static forRoot() {
    return {
      ngModule: CoreModule
    };
  }
}
