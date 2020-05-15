import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { timer } from 'rxjs/observable/timer'
import { UserStore } from '../../../store'

const KEEP_ALIVE_MILLIS = 120000

@Component({
    selector: 'meditor-app',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="app-container" fxFill fxLayout="column" fxLayoutAlign="start none">
            <med-toolbar fxFlex="82px"></med-toolbar>
            <div fxFlex="80" style="overflow: scroll; padding: 0 16px;">
                <router-outlet></router-outlet>
            </div>
            <med-loading></med-loading>
            <med-notification></med-notification>
        </div>
    `,
    styleUrls: ['main.component.scss'],
})
export class MainComponent implements OnInit {
    isLoggedIn: boolean = false
    loggedInSubscriber: any

    constructor(private userStore: UserStore) {}

    ngOnInit() {
        this.loggedInSubscriber = this.userStore.loggedIn$.subscribe(
            (isLoggedIn: boolean) => (this.isLoggedIn = isLoggedIn)
        )
        this.keepAlive()

        this.userStore.fetchUser()
    }

    ngOnDestroy() {
        this.loggedInSubscriber.unsubscribe()
    }

    keepAlive() {
        timer(undefined, KEEP_ALIVE_MILLIS).subscribe(() => {
            if (!this.isLoggedIn) return
            this.userStore.fetchUser()
        })
    }
}
