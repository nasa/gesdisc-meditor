export class Comment {
	constructor(
	  public _id: string,
	  public _parentId: string,
	  public author: string,
	  public text: string,
	  public deleted: boolean,
	  public children: [Comment]
	) {};
}
