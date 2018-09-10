export class NotificationOpen {
    static readonly type = '[Notification] Open Notification';

    constructor (public payload: { 
        message: string,
        action?: string,
        config?: string,
    }) {}
};

export class NotificationClose {
    static readonly type = '[Notification] Close Notification';
};
