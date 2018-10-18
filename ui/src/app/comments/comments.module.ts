import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommentComponent } from './components/comment/comment.component';
import { CommentsComponent } from './containers/comments.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
  	CommentsComponent
  ],
  declarations: [ CommentComponent, CommentsComponent ]
})
export class CommentsModule { }
