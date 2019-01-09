import { Component, ChangeDetectionStrategy, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Comment, User } from 'app/service/model/models';
import { UseExistingWebDriver } from 'protractor/built/driverProviders';

@Component({
	selector: 'med-comments',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './comments.component.html',
	styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {

  @Input() comments: Comment[];
  @Input() versionFilter: Date;
  @Input() user: User;
  @Output() closeSidenav: EventEmitter<any> = new EventEmitter();
  @Output() resolveComment: EventEmitter<string> = new EventEmitter();
  @Output() editComment: EventEmitter<any> = new EventEmitter();
  @Output() submitComment: EventEmitter<any> = new EventEmitter();
	showResolved: boolean = false;
	showForm: boolean = false;
  commentText: string = '';

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

	submitNewComment(text?: string, parentId?: string) {
		let commentData = {
			'text': text || this.commentText,
			'resolved': false,
			'parentId': parentId || 'root'
		};
    this.submitComment.emit(commentData);
		if (!parentId) this.toggleForm();
	}

}

