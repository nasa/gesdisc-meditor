import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Comment } from '../../../service/model/comment';

import * as _ from 'underscore';

@Component({
  selector: 'med-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

	extComments: Array<any>;
	_tree: boolean;
	_showResolved: boolean;
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

	@Output() resolveComment = new EventEmitter<string>();
	@Output() replyComment = new EventEmitter<Object>();


  ngOnInit() {
  }

  resolve(_id) {
  	this.resolveComment.emit(_id);
  }

  replyTo(_id) {
  	_.find(this.extComments, function(comment) { return comment._id == _id }).replyTo = true;
  }

  closeReply(_id) {
  	_.find(this.extComments, function(comment) { return comment._id == _id }).replyTo = false;
  }

  treeify(list, idAttr, parentAttr, childrenAttr) {
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
