import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'encodeURIComponent'
})
export class EncodeURIComponentPipe implements PipeTransform {
  
  transform (input: any) { 
    return typeof input !== 'string' ? input : encodeURIComponent(input);
  }

}