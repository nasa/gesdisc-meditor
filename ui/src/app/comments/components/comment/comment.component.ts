import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Comment } from '../../../service/model/comment';

import * as _ from 'underscore';

@Component({
  selector: 'med-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  @ViewChildren('commentThread') commentThreads: QueryList<CommentComponent>;
  @ViewChild('commentForm') commentForm: ElementRef;
	extComments: Array<any>;
  _parentId: string;
	_tree: boolean;
	_showResolved: boolean;
  _replyTo: boolean;
	commentText: string;

	@Input()
	set comments(comments: Comment[]) {
		this.extComments = comments.map(c => Object.assign({}, c));
		if(this._tree) this.extComments = this.treeify(this.extComments, '_id', 'parentId', 'children');

	};

	@Input()
	set tree(tree: boolean) {
		this._tree = tree;
	}

	@Input()
	set showResolved(showResolved: boolean) {
		this._showResolved = showResolved;
	}

  @Input()
	set parentId(parentId: string) {
		this._parentId = parentId;
	}

	@Output() resolveComment = new EventEmitter<string>();
	@Output() replyComment = new EventEmitter<Object>();


  ngOnInit() {
  }

  resolve(_id: string) {
  	this.resolveComment.emit(_id);
  }

  openReplyForm(_id: string) {
    let comment = _.find(this.extComments, function(comment) { return comment._id == _id });
    if(comment && comment.children.length > 0) {
      let commentThread = this.commentThreads.find((i => {return i._parentId == _id}));
      if (commentThread) { commentThread.openReplyForm(_id); }
    } else {
      this.extComments[this.extComments.length - 1].replyTo = true;
      setTimeout(() => { this.commentForm.nativeElement.scrollIntoView({behavior: "smooth"});}, 100)
    }
  }

  closeReply(_id: string) {
  	_.find(this.extComments, function(comment) { return comment._id == _id }).replyTo = false;
  }

  treeify(list: Array<any>, idAttr: string, parentAttr: string, childrenAttr: string) {
    if (!idAttr) idAttr = 'id';
    if (!parentAttr) parentAttr = 'parent';
    if (!childrenAttr) childrenAttr = 'children';

    var treeList = [];
    var lookup = {};
    list.forEach(function(obj) {
        lookup[obj[idAttr]] = obj;
        obj[childrenAttr] = [];
    });
    list.forEach(function(obj) {
        if (obj[parentAttr] != null && obj[parentAttr] != 'root') {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
        } else {
            treeList.push(obj);
        }
    });
    return treeList;
	};

	submitComment(_id, parentId) {
		if (parentId == 'root') parentId = _id
		let commentData = {
			'text': this.commentText,
			'parentId': parentId
		};
		this.closeReply(_id);
		this.replyComment.emit(commentData);
		this.commentText = '';
	}

	submitChildComment(event) {
		let commentData = {
			'text': event.text,
			'parentId': event.parentId
		};
		this.replyComment.emit(commentData);
	}

}
