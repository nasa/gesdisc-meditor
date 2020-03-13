import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

interface Notification {
    show: boolean
    message: string
    action: 'success' | 'fail' | undefined
}

@Injectable({ providedIn: 'root' })
export class NotificationStore {
    private readonly _notification = new BehaviorSubject<Notification>({
        show: false,
        message: '',
        action: undefined,
    })

    readonly notification$ = this._notification.asObservable()

    constructor() {
        //
    }

    get notification(): Notification {
        return this._notification.getValue()
    }

    set notification(notification: Notification) {
        this._notification.next(notification)
    }

    showSuccessNotification(message: string) {
        this.notification = {
            message,
            action: 'success',
            show: true,
        }
    }

    showErrorNotification(message: string) {
        this.notification = {
            message,
            action: 'fail',
            show: true,
        }
    }

    closeNotification() {
        let notification = this.notification
        notification.show = false
        this.notification = notification
    }
}
