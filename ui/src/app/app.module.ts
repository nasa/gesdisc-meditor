import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { BrowserModule, Title } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { FlexLayoutModule } from '@angular/flex-layout'

import { SnackBarComponent } from './core/components/notification/notification.component'
import { CoreModule } from './core/core.module'
import { ApiModule } from './service/api.module'
import { MaterialModule } from './material'

import { MainComponent } from './core/containers/main/main.component'
import { BASE_PATH } from './service'
import { environment } from '../environments/environment'

import { routes } from './routes'
import {
    DocumentResolver,
    ModelResolver,
    DocEditResolver,
    ModelsResolver,
    AuthGuard,
    RedirectGuard,
} from './shared/resolvers/'

import { UnauthorizedInterceptor } from './auth/interceptors/unauthorized.interceptor'

import { AppStore, ModelStore, NotificationStore, UserStore, WorkflowStore } from './store/'

// const routeResolvers = Object.keys(resolvers).map(key => resolvers[key])	// TODO: remove this and use Object.values (need typescript to support ES2017)
const routeResolvers = [DocumentResolver, ModelResolver, DocEditResolver, ModelsResolver, AuthGuard, RedirectGuard]

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FlexLayoutModule,
        MaterialModule,
        CoreModule.forRoot(),
        RouterModule.forRoot(routes, { useHash: true }),
        ApiModule,
    ],
    providers: [
        { provide: BASE_PATH, useValue: environment.API_BASE_PATH },
        ...routeResolvers,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: UnauthorizedInterceptor,
            multi: true,
        },
        Title,
        AppStore,
        ModelStore,
        NotificationStore,
        UserStore,
        WorkflowStore,
    ],
    declarations: [SnackBarComponent],
    entryComponents: [SnackBarComponent],
    bootstrap: [MainComponent],
})
export class AppModule {}
