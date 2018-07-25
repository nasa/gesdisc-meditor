import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxAutoScrollModule } from "ngx-auto-scroll";

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { reducers, effects } from './store';

import { CommentComponent } from './components/comment/comment.component';
import { CommentsComponent } from './containers/comments.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxAutoScrollModule,
    StoreModule.forFeature('comments', reducers),
		EffectsModule.forFeature(effects),
  ],
  exports: [
  	CommentsComponent
  ],
  declarations: [ CommentComponent, CommentsComponent ]
})
export class CommentsModule { }
