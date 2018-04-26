// service and other application-specific parts
import { ContentType } from '../../models/content-type'
import { ContentTypeService } from './content-type.service';
import { CONTENT_TYPES } from '../../mock-data/content-type.mock'
import { environment } from '../../../../environments/environment'

// Other generic imports
import { async, TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as _ from 'lodash';

describe('ContentTypeService', () => {
  let contentTypeService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      providers: [ ContentTypeService ]
    });
  });

  it('should be created', inject([ContentTypeService], (contentTypeService) => {
    expect(contentTypeService).toBeDefined();
  }));

  describe('#listModels', () => {
    it('should exist', inject([ContentTypeService], (contentTypeService) => {
      expect(contentTypeService.listModels).toBeDefined();
    }));
  
    it('should return something', async(inject([ContentTypeService], (contentTypeService) => {
      expect(contentTypeService).toBeDefined();
      contentTypeService.listModels().subscribe( result => { 
        expect(result).toBeDefined();
      });
    })));
  
    it('should return exactly eight (8) content types', async(inject([ContentTypeService], (contentTypeService) => {
      expect(contentTypeService).toBeDefined();
      contentTypeService.listModels().subscribe( result => { 
        expect(result.length).toBe(8);
      });
    })));
  
    for (let contentType of CONTENT_TYPES) {
      describe('"' + contentType.name + '" content type', () => {

        it('should exist', async(inject([ContentTypeService], (contentTypeService) => {
          expect(contentTypeService).toBeDefined();
          contentTypeService.listModels().subscribe( result => { 
            expect(_.find(result, function(o) { return o.name === contentType.name; })).toBeTruthy();
          });
        })));
  
        it('should be unique', async(inject([ContentTypeService], (contentTypeService) => {
          expect(contentTypeService).toBeDefined();
          contentTypeService.listModels().subscribe( result => { 
            expect(_.filter(result, function(o) { return o.name === contentType.name; }).length).toBe(1);
          });
        })));
  
        it('should contain the appropriate description', async(inject([ContentTypeService], (contentTypeService) => {
          expect(contentTypeService).toBeDefined();
          contentTypeService.listModels().subscribe( result => { 
            expect(_.find(result, function(o) { return o.name === contentType.name; }).description)
            .toBe(contentType.description);
          });
        })));
  
        describe('icon', () => {
  
          it('should exist', async(inject([ContentTypeService], (contentTypeService) => {
            expect(contentTypeService).toBeDefined();
            contentTypeService.listModels().subscribe( result => { 
              expect(_.find(result, function(o) { return o.name === contentType.name; }).icon).toBeDefined();
            });
          })));
  
          it('should have the appropriate color', async(inject([ContentTypeService], (contentTypeService) => {
            expect(contentTypeService).toBeDefined();
            contentTypeService.listModels().subscribe( result => { 
              expect(_.find(result, function(o) { return o.name === contentType.name; }).icon.color).toBe(contentType.icon.color);
            });
          })));
  
          it('should have the appropriate css class name (image)', async(inject([ContentTypeService], (contentTypeService) => {
            expect(contentTypeService).toBeDefined();
            contentTypeService.listModels().subscribe( result => { 
              expect(_.find(result, function(o) { return o.name === contentType.name; }).icon.name).toBe(contentType.icon.name);
            });
          })));
        });
      });
    }
  });
});