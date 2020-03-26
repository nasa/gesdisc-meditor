import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'

@Injectable()
export class RedirectGuard implements CanActivate {
    constructor(private router: Router) {}

    async canActivate(route: any, state: any): Promise<boolean> {
        return true
    }
}
