import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/do';

// model
import { ContentType } from '../../models/content-type';

// mock data
import { CONTENT_TYPES } from '../../mock-data/content-type.mock';

@Injectable()
export class ContentTypeService {
  // set this as an env variable
  private readonly URL = 'http://localhost:8082/meditor';

  constructor(protected httpClient: HttpClient) {}

  public listModels(): Observable<Array<ContentType>> {
    return this.httpClient.get<Array<ContentType>>(this.URL+'/listModels');
  }

  // getContentTypes() {
  //   return CONTENT_TYPES;
  // }
}
