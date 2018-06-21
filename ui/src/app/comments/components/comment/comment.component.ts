import { Component, OnInit, Input } from '@angular/core';
// import { CommonService } from '../../common.service';
import { Observable } from 'rxjs/Rx';
import { FormControl, FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Comment } from '../../models/comment';

import * as _ from 'underscore';

@Component({
  selector: 'med-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

	@Input() comments: Comment[];

  commentForm: FormGroup;
  author:string='';
  comment:string='';

  constructor(private fb: FormBuilder) {
  	this.commentForm = fb.group({
	  	'author': [null, Validators.required],
	  	'text': [null, Validators.required],
	  	'_parentId': [null, Validators.required]
	  })
  }

  ngOnInit() {
  }

  onFormSubmit(form: any) {
  	let comment;
  	comment = {
  		'author': form.author,
  		'text': form.text,
  		'_parentId': form._parentId
  	}
  	// this.commentService.create(comment).subscribe(
   //    data => {
   //    	let parentComment  = _.find(this.comments, function(comment) { return comment._id == form._parentId; });
   //    	parentComment.replyTo = false;
			// 	comment.children = [];
			// 	parentComment.children.push(comment);
   //    },
   //    err => console.error(err),
   //    () => { console.log('done creating new comment') }
   //  );

  }

  replyTo(id, parentId) {
  	_.find(this.comments, function(comment) { return comment._id == id }).replyTo = true;
  }

  delete(id) {
  	// this.commentService.delete(id).subscribe(
  	// 	data => { _.find(this.comments, function(comment) { return comment._id == id }).deleted = true; },
   //    err => console.error(err),
   //    () => { }
   //  );
  }

  showReplies(id, parentId) {
  	let comment = _.find(this.comments, function(comment) { return comment._id == id });
  	if(comment.visible) {
  		_.find(this.comments, function(comment) { return comment._id == id }).visible = false;
  	} else {
  		_.find(this.comments, function(comment) { return comment._id == id }).visible = true;
  	}
  }

}
