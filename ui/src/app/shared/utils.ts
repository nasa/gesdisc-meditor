import { ApplicationRef, NgZone } from '@angular/core'
import { Router } from '@angular/router'

/**
 * fixes a bug on Macs where a page is navigated to from a back button click and the rendering freezes until the user clicks
 * the page (user interactions cause application ticks). Unfortunately, Angular keeps closing related issues
 * (https://github.com/angular/angular/issues/26829, https://github.com/angular/angular/issues/9565#issuecomment-229870503, etc.)
 * without a resolution so this is a way to force the page to render by manually causing an application tick.
 */
export function forceTickOnRender(
    router: Router,
    applicationRef: ApplicationRef,
    zone: NgZone
) {
    router.events.subscribe(() => {
        zone.run(() =>
            setTimeout(() => {
                applicationRef.tick()
            }, 0)
        )
    })
}
