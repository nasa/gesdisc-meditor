import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ModelResolver } from './model.resolver';
import { DocumentResolver } from './document.resolver';

@Injectable()
export class DocEditResolver implements Resolve<{model: void, document: void}> {
	constructor(
		private modelResolver: ModelResolver,
		private documentResolver: DocumentResolver
	) {}

	async resolve(route: ActivatedRouteSnapshot): Promise<{model: void, document: void}> {
		const model = await this.modelResolver.resolve(route);
		const document = await this.documentResolver.resolve(route);

		return { model, document };
	}
}
