export class ContentType {
	constructor(
    public name: string,
    public description: string,
    public icon: ContentTypeIcon,
    public count?: number
  ) {};
}

export class ContentTypeIcon {
  constructor(
    public name: string,
    public color: string
  ) {};
}
