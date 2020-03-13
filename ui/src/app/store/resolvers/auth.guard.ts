import { Injectable } from '@angular/core'
import { RouterStateSnapshot, CanActivate } from '@angular/router'
import { map, take } from 'rxjs/operators'
import { UserStore } from '../user.store'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private userStore: UserStore) {}

    canActivate(route: any, state: RouterStateSnapshot): Observable<boolean> {
        return this.userStore.loggedIn$.pipe(
            map((isLoggedIn: boolean) => {
                localStorage.setItem('returnUrl', state.url)

                return isLoggedIn
            }),
            take(1)
        )
    }
}
