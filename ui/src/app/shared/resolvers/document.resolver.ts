import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetDocument } from 'app/store/document/document.state';

@Injectable()
export class DocumentResolver implements Resolve<void> {

    constructor(private store: Store) {}

    private getDocument(model: string, title: string) {
        return this.store.dispatch(new GetDocument({ model, title }))
    }

	resolve(route: ActivatedRouteSnapshot) {
        const modelName = route.queryParams.model;
        const documentTitle = route.queryParams.title;

        return new Promise<void>((resolve: any) => {
            this.getDocument(modelName, documentTitle).subscribe((store: any) => {
                resolve(store.documents.currentDocument);
            });
        });
    }
    
}
