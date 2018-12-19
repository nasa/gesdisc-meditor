import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Store } from '@ngxs/store';
import { OpenLoginDialog, OpenSessionTimeoutDialog } from 'app/store/auth/auth.state';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {

  constructor(private store: Store, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).do((event: HttpEvent<any>) => {}, (err: any) => {
      if (!(err instanceof HttpErrorResponse && err.status === 401)) return;

      this.store.dispatch(this.router.url === '/' ? new OpenLoginDialog() : new OpenSessionTimeoutDialog())
    });
  }

}