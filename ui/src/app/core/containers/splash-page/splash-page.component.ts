import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { ModelStore } from '../../../store/model.store'

@Component({
    selector: 'med-splash-page',
    templateUrl: './splash-page.component.html',
    styleUrls: ['./splash-page.component.css'],
})
export class SplashPageComponent implements OnInit {
    constructor(
        public modelStore: ModelStore,
        private titleService: Title,
        private router: Router
    ) {}

    ngOnInit() {
        localStorage.clear()
        this.titleService.setTitle('mEditor')
    }

    goToSearchPage(event: any) {
        this.router.navigate(['/search'], {
            queryParams: { model: event.name },
        })
    }
}
