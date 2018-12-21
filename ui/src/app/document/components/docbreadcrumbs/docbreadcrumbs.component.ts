import { Component, Input } from '@angular/core';

@Component({
  selector: 'med-doc-breadcrumbs',
  templateUrl: './docbreadcrumbs.component.html',
  styleUrls: ['./docbreadcrumbs.component.scss']
})
export class DocBreadcrumbsComponent {

    @Input() document: any
    @Input() model: any

}
