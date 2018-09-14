import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ModelResolver, DocumentResolver } from './index';

export class DocEditResolver implements Resolve<{model: void, document: void}> {
	constructor(
		private modelResolver: ModelResolver,
		private documentResolver: DocumentResolver
	) {}

	async resolve(route): Promise<{model: void, document: void}> {
		const model = await this.modelResolver.resolve(route);
		const document = await this.documentResolver.resolve(route);

		return { model, document };
	}
}
