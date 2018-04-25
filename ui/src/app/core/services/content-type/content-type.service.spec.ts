import { TestBed, inject } from '@angular/core/testing';
import { ContentType } from '../../models/content-type'
import { ContentTypeService } from './content-type.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CONTENT_TYPES } from '../../mock-data/content-type.mock'

describe('ContentTypeService', () => {
  let service: ContentTypeService;
  let http: HttpClient;
  beforeEach(() => { service = new ContentTypeService(http) });

  it('#listModels should return real value', () => {
    // let mockData: ContentType[];
    // let mockDatum = Object.create(ContentType.prototype);
    // Object.assign(mockDatum, 
    //   {
    //     name : "Alerts",
    //     description : "Message to notify visitors of important information regarding data availability, site availability and performance issues.",
    //     icon : {
    //       name : "fa-warning",
    //       color : "#FFC104"
    //     }
    //   });

    // mockData.push(mockDatum);


    let CONTENT_TYPES: ContentType[] = [
      { 
        name: 'Alerts', 
        description: 'Message to notify visitors of important information regarding data availability, site availability and performance issues.',
        icon: {
          name: 'fa-warning',
          color: '#FFC104'
        }
      }
    ];

    // service.listModels().subscribe(result => 
    //   {
    //     // expect(result).toBeDefined();
    //     // expect(result.length).toBe(8);
    //     // expect(result).toEqual(CONTENT_TYPES);
    //   }
    // );
  });

  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     imports: [ ],
  //     providers: [ ContentTypeService ]
  //   });
  // });

  // it('should be created', inject([ContentTypeService], (service: ContentTypeService) => {
  //   expect(service).toBeTruthy();
  // }));
});
