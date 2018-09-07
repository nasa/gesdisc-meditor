
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import { DefaultService } from '../../../service/api/default.service';
import * as fromDocument from '..';


/**
 * Guards are hooks into the route resolution process, providing an opportunity
 * to inform the router's navigation process whether the route should continue
 * to activate this route. Guards must return an observable of true or false.
 */
@Injectable()
export class DocumentExistsGuard implements CanActivate {

  modelName: string;

  constructor(
    private store: Store<fromDocument.DocumentDataState>,
    private defaultService: DefaultService,
    private router: Router
  ) { 
  }

  /**
   * This method checks if document fro route is already registered
   * in the Store
   */  
  hasDocumentInStore(title: string): Observable<boolean> {
    return this.store.pipe(
      select(fromDocument.getDocument),
      map(document =>  { 
        if(document.doc) {
          return document.doc['title'] == title 
        } else { return false}
      }),
      take(1)
    );
  }

  /**
  * This method loads document from the API and caches
  * it in the store, returning `true` or `false` if it was found.
  */
  hasDocumentInApi(modelName: string, title: string): Observable<boolean> {
    return this.defaultService.getDocument(modelName, title).pipe(
      map(document => new fromDocument.LoadDocumentComplete(document)),
      tap((action: fromDocument.LoadDocumentComplete) => { this.store.dispatch(action) }),
      map(document => !!document),
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
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {    
    let title = route.queryParams['title'];
    let modelName = route.queryParams['model'];
    return this.hasDocumentInStore(title).pipe(
      switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        }
        return this.hasDocumentInApi(modelName, title);
      })
    );
  }
}