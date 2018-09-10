
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import { DefaultService } from '../../service/api/default.service';
import * as fromApp from '..';
import * as _ from 'underscore';
import { Edge } from '../../service/model/workflow';

/**
 * Guards are hooks into the route resolution process, providing an opportunity
 * to inform the router's navigation process whether the route should continue
 * to activate this route. Guards must return an observable of true or false.
 */
@Injectable()
export class SelectedModelExistsGuard implements CanActivate {
  constructor(
    private store: Store<fromApp.AppState>,
    private defaultService: DefaultService,
    private router: Router
  ) { }

  /**
   * This method checks if selected model is already registered
   * in the Store
   */    
  hasSelectedModelInStore(modelName: string): Observable<boolean> {
    return this.store.pipe(
      select(fromApp.selectCurrentModel),
      map(model => model && model.name == modelName ? true : false),
      take(1)
    );
  } 
  

  hasSelectedModelInApi(modelName: string): Observable<boolean> {
    return this.defaultService.getModel(modelName).pipe(
      switchMap((model) =>
        this.defaultService
          .getDocument('Workflows', model.workflow)
          .pipe(
            switchMap((workflow) => {              
              let initEdge = this.findInitialEdge(workflow.doc.edges);
              this.store.dispatch(new fromApp.SetInitialEdge(initEdge))
              return [new fromApp.LoadWorkflowComplete(workflow.doc)]
            }),
            tap((action: any) => { 
              console.log(action);
              this.store.dispatch(action)              
              this.store.dispatch( new fromApp.SelectModel(modelName))
              this.store.dispatch(new fromApp.LoadSelectedModelComplete(model))
            }),
            map(selectedModel => !!selectedModel),
            catchError(err => {
              this.store.dispatch(new fromApp.LoadSelectedModelError(err))
              this.router.navigate(['/404']);
              return of(false);
            })
          )
      )
    )
  }  
  
  findInitialEdge(edges: any) {
		let sources = _.pluck(edges, 'source');
		let targets = _.pluck(edges, 'target');
		let initEdge = sources.filter(e => !targets.includes(e))[0];
		return _.findWhere(edges, { source: initEdge}) as Edge
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
    let modelName = route.queryParams['model'];
    return this.hasSelectedModelInStore(modelName).pipe(
      switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        }
        return this.hasSelectedModelInApi(modelName);
      })
    );
  }
}