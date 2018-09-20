export class GetDocument {
	static readonly type = '[Document] Get Document';

	constructor (public payload: {
		model: string,
		title: string,
		version?: string,
	}) {}
}

export class UpdateCurrentDocument {
	static readonly type = '[Document] Save Document';

	constructor (public payload: {
		document: any,
	}) {}
}

export class CreateDocument {
	static readonly type = '[Document] Create Document';

	constructor (public payload: {
		model: string,
		document: any,
	}) {}
}

export class GetCurrentDocumentHistory {
	static readonly type = '[Document] Get Current Document History';
}

export class GetCurrentDocumentVersion {
	static readonly type = '[Document] Get Current Document Version';

	constructor (public payload: {
		version: string,
	}) {}
}

export class UpdateDocumentState {
	static readonly type = '[Document] Send Document For Review';

	constructor (public payload: {
		state: string
	}) {}
}

