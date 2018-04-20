import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
// CONTAINERS
import { MainComponent } from './containers/main';
import { NotFoundPageComponent } from './containers/not-found-page';
import { SplashPageContainer } from './containers/splash-page/splash-page.container';
// COMPONENTS
import { ContentTypeBoxComponent } from './components/content-type-button/content-type-button.component';
import { ContentTypeSplashComponent } from './components/splash-box/splash-box.component';
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
  SplashPageContainer,
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
