import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentComponent } from './components/comment/comment.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
  	CommentComponent
  ],
  declarations: [ CommentComponent ]
})
export class CommentsModule { }
