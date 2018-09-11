import { Routes } from '@angular/router';
import { SearchPageComponent } from './containers/search-page.component';
import { ModelResolver, ModelsResolver } from 'app/store/resolvers/';

export const routes: Routes = [
    {
        path: '',
        component: SearchPageComponent,
        resolve: {
            model: ModelResolver,
            models: ModelsResolver,
        }
    }
];
