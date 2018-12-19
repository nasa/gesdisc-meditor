import { Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';

@Component({
  selector: 'med-doc-breadcrumbs',
  templateUrl: './docbreadcrumbs.component.html',
  styleUrls: ['./docbreadcrumbs.component.scss']
})
export class DocBreadcrumbsComponent {

    @Input() document: any
    @Input() model: any

    constructor(private store: Store) {}

    navigate(path: string, queryParams: any = {}) {
        this.store.dispatch(new Navigate([ path ], queryParams));
    }

}
