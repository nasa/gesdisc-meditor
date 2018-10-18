import { Component, ChangeDetectionStrategy, OnInit, Input, EventEmitter, Output } from '@angular/core';

// import { Store } from '@ngxs/store';
// import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'med-comments',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './comments.component.html',
	styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {

  @Input() comments: Comment[];
  @Output() closeSidenav: EventEmitter<any> = new EventEmitter();
  @Output() resolveComment: EventEmitter<string> = new EventEmitter();
  @Output() submitComment: EventEmitter<any> = new EventEmitter();
	// comments$: Observable<any>;
	showResolved: boolean = false;


	showForm: boolean = false;
  commentText: string = '';

	// constructor(
	// 	private commentsStore: Store<fromComments.CommentsState>
	// ) {
  //   this.commentsStore.dispatch(new fromComments.LoadComments(''));
  //   this.comments$ = this.commentsStore.pipe(select(fromComments.selectAllComments));
	// }

	ngOnInit() {	
	}
	
	close() {
    this.closeSidenav.emit();
  }

	toggleForm() {
		this.showForm = !this.showForm;
		this.commentText = '';
	}

  toggleResolvedComments() {
		this.showResolved = !this.showResolved;
	}

	// resolveCommentEmit(_id: string) {

		// this.commentsStore.dispatch(new fromComments.ResolveComment(_id))
	  // }

	submitNewComment(text?: string, parentId?: string) {
		let commentData = {
			'text': text || this.commentText,
			// 'CommentsId': this.routeParams['title'],
			'resolved': false,
			'parentId': parentId || 'root'
		};
		// this.commentsStore.dispatch(new fromComments.SubmitComment(commentData));
    this.submitComment.emit(commentData);
		if (!parentId) this.toggleForm();
		// this.commentsStore.dispatch(new fromComments.LoadComments(this.routeParams['title']));
	}

}

