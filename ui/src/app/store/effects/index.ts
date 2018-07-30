import { ModelEffects } from './model.effects';
import { NotificationEffects } from './notification.effects';
import { RouterEffects } from './router.effects';

export const effects: any[] = [ModelEffects, NotificationEffects, RouterEffects];

export * from './model.effects';
export * from './notification.effects';
export * from './router.effects';