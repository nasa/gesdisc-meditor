import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bcEllipsis' })
export class EllipsisPipe implements PipeTransform {
  transform(str: string, strLength: number = 250) {
    if (!str) return str

    const withoutHtml = str.replace(/(<([^>]+)>)/gi, '');

    if (str.length >= strLength) {
      return `${withoutHtml.slice(0, strLength)}...`;
    }

    return withoutHtml;
  }
}
