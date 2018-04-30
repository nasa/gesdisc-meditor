import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { map } from 'rxjs/operators';
// import 'rxjs/add/operator/do';

// model
import { ContentType } from '../../../models/content-type';

// mock data
import { CONTENT_TYPES } from '../../mock-data/content-type.mock';

@Injectable()
export class ContentTypeService {
  // set this as an env variable
  private readonly URL = 'http://localhost:8082/meditor';

  constructor(protected httpClient: HttpClient) {}

  public listModels(): Observable<ContentType[]> {
    return this.httpClient
    	.get<{items: ContentType[]}>(this.URL+'/listModels')
    	.pipe(map(models => models.items || []))
  }

  public getContentTypes(): Observable<ContentType[]> {
		return Observable.create((observer: Subscriber<any>) => {
	    observer.next(CONTENT_TYPES);
	    observer.complete();
		});
  }
}
