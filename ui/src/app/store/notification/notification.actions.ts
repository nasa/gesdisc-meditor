export class NotificationOpen {
    static readonly type = '[Notification] Open Notification';

    constructor (public message: string) {}
};

export class SuccessNotificationOpen {
    static readonly type = '[Notification] Open Success Notification'

    constructor (public message: string) {}
}

export class ErrorNotificationOpen {
    static readonly type = '[Notification] Open Error Notification'

    constructor (public message: string) {}
}

export class NotificationClose {
    static readonly type = '[Notification] Close Notification';
};
