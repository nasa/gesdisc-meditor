import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

const ROUTE_LOADING_SHOW_DELAY_MILLIS = 100;    // if route takes more than this to load, loading icon will show
const ROUTE_LOADING_HIDE_DELAY_MILLIS = 700;    // time to delay before hiding, to reduce flash of loading icon

@Component({
	selector: 'med-loading',
	template: `
	<div #loading [ngClass]="{'med-loading':true, 'active':isLoading}">
		<mat-progress-spinner
			color="primary"
			mode="indeterminate">
		</mat-progress-spinner>

		<div>Loading</div>
	</div>
	`,
	styleUrls: ['loading.component.scss']
})
export class LoadingComponent implements OnInit {

	isLoading: boolean = false;

	private delayTimeout: any = null;

	constructor(private router: Router, private cdRef: ChangeDetectorRef) {}

	ngOnInit() {
		this.router.events.subscribe((event: any) => {
			if (event instanceof NavigationStart) {
				this.showLoading();
			}

			if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
				this.hideLoading();
			}
		});
	}

	showLoading() {
		clearTimeout(this.delayTimeout);

		this.delayTimeout = setTimeout(() => {
			this.isLoading = true;
			this.cdRef.detectChanges();
		}, ROUTE_LOADING_SHOW_DELAY_MILLIS);
	}

	hideLoading() {
		clearTimeout(this.delayTimeout);

		if (!this.isLoading) return;

		this.delayTimeout = setTimeout(() => {
			this.isLoading = false;
			this.cdRef.detectChanges();
		}, ROUTE_LOADING_HIDE_DELAY_MILLIS);
	}

}
