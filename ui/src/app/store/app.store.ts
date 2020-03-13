import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

interface NavigationOptions {
    queryParams?: any
    reloadSameRoute?: boolean
}

@Injectable({ providedIn: 'root' })
export class AppStore {
    constructor(private router: Router) {
        //
    }

    navigate(url: string, options: NavigationOptions) {
        const { queryParams = {}, reloadSameRoute = false } = options

        const navigateToUrl = () => {
            this.router.navigate([url], { queryParams })
        }

        if (reloadSameRoute) {
            this.router.navigateByUrl('/redirect', { skipLocationChange: true }).then(navigateToUrl)
        } else {
            navigateToUrl()
        }
    }
}
