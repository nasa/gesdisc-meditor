import { Component } from '@angular/core'
import { UserStore } from '../../../store'

@Component({
    selector: 'med-login-status',
    template: `
        <button
            mat-button
            (click)="logout()"
            color="accent"
            *ngIf="userStore.user$ | async as user"
            (mouseenter)="toggleButton()"
            (mouseleave)="toggleButton()"
        >
            <mat-icon>{{ userBtn ? 'person' : 'exit_to_app' }}</mat-icon>
            {{ userBtn ? 'Hi, ' + user.firstName : 'Logout' }}
        </button>
    `,
})
export class LoginStatusComponent {
    userBtn: boolean = true

    constructor(public userStore: UserStore) {}

    logout() {
        this.userStore.logout()
    }

    toggleButton() {
        this.userBtn = !this.userBtn
    }
}
