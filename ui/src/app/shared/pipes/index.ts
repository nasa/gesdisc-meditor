import { NgModule } from '@angular/core';

import { AddCommasPipe } from './add-commas/add-commas';
import { EllipsisPipe } from './ellipsis/ellipsis';
import { EncodeURIComponentPipe } from './encode-uri-component/encode-uri-component'

export const PIPES = [AddCommasPipe, EllipsisPipe, EncodeURIComponentPipe];

@NgModule({
  declarations: PIPES,
  exports: PIPES,
})
export class PipesModule {}
