// import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

// import { ActivatedRoute, Params } from '@angular/router';
// import * as fromComments from '../store';

// import { Store, select } from '@ngrx/store';
// import { Observable } from 'rxjs/Observable';

// @Component({
// 	selector: 'med-comments',
// 	changeDetection: ChangeDetectionStrategy.OnPush,
// 	templateUrl: './comments.component.html',
// 	styleUrls: ['./comments.component.css'],
// })
// export class CommentsComponent implements OnInit {

// 	comments$: Observable<any>;
// 	routeParams: any;
// 	showResolved: boolean = false;


// 	showForm: boolean = false;
//   commentText: string = '';

// 	constructor(
// 		private commentsStore: Store<fromComments.CommentsState>,
// 		private route: ActivatedRoute
// 	) {
//     this.commentsStore.dispatch(new fromComments.LoadComments(''));
//     this.comments$ = this.commentsStore.pipe(select(fromComments.selectAllComments));
// 	}

// 	ngOnInit() {	
// 	}
	
// 	close() {}

// 	toggleForm() {
// 		this.showForm = !this.showForm;
// 		this.commentText = '';
// 	}

// 	resolveComment(_id: string) {
// 		this.commentsStore.dispatch(new fromComments.ResolveComment(_id))
// 	}

// 	submitComment(text?: string, parentId?: string) {
// 		let commentData = {
// 			'text': text || this.commentText,
// 			'CommentsId': this.routeParams['title'],
// 			'resolved': false,
// 			'parentId': parentId || 'root'
// 		};
// 		this.commentsStore.dispatch(new fromComments.SubmitComment(commentData));
// 		if (!parentId) this.toggleForm();
// 		this.commentsStore.dispatch(new fromComments.LoadComments(this.routeParams['title']));
// 	}

// 	toggleResolvedComments() {
// 		this.showResolved = !this.showResolved;
// 	}

// }
