export class ContentType {
	constructor(
        public name: String,
        public description: String,
        public icon: ContentTypeIcon,
        public count?: Number
    ) {};
}

export class ContentTypeIcon {
    constructor(
        public name: String,
        public color: String
    ) {};
}