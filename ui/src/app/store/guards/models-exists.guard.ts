
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import { DefaultService } from '../../service/api/default.service';
import * as fromApp from '..';


/**
 * Guards are hooks into the route resolution process, providing an opportunity
 * to inform the router's navigation process whether the route should continue
 * to activate this route. Guards must return an observable of true or false.
 */
@Injectable()
export class ModelsExistsGuard implements CanActivate {
  constructor(
    private store: Store<fromApp.AppState>,
    private defaultService: DefaultService,
    private router: Router
  ) { }

  /**
   * This method checks if models are already registered
   * in the Store
   */  
  hasModelsInStore(): Observable<boolean> {
    return this.store.pipe(
      select(fromApp.getModelsLoaded),
      map(loadedModels => loadedModels),
      take(1)
    );
  }

  /**
   * This method loads models from the API and caches
   * it in the store, returning `true` or `false` if it was found.
   */
  hasModelsInApi(): Observable<boolean> {
    return this.defaultService.listModels().pipe(
      map(models => new fromApp.LoadModelsComplete(models)),
      tap((action: fromApp.LoadModelsComplete) => { 
        this.store.dispatch(action) }),
      map(models => !!models),
      catchError(() => {
        this.router.navigate(['/404']);
        return of(false);
      })
    );
  }  

  

  

  /**
   * This is the actual method the router will call when our guard is run.
   *
   * Our guard checks if we need
   * to request models from the API or if we already have it in our cache.
   * If it finds it in the cache or in the API, it returns an Observable
   * of `true` and the route is rendered successfully.
   *
   * If it was unable to find it in our cache or in the API, this guard
   * will return an Observable of `false`, causing the router to move
   * on to the next candidate route. In this case, it will move on
   * to the 404 page.
   */
  canActivate(): Observable<boolean> {
    return this.hasModelsInStore().pipe(
      switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        }
        return this.hasModelsInApi();
      })
    );
  }
}