import { Component, DebugElement, Input } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeButtonComponent } from './content-type-button.component';
import { ContentType, ContentTypeIcon } from '../../models/content-type';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { MaterialModule } from '../../../material';
import { MatButtonModule } from '@angular/material/button'
import { FlexLayoutModule } from '@angular/flex-layout';

describe('ContentTypeButtonComponent', () => {
  let component: ContentTypeButtonComponent;
  let fixture: ComponentFixture<ContentTypeButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTypeButtonComponent ],
      imports: [MatButtonModule, MaterialModule, FlexLayoutModule, AngularFontAwesomeModule]
    })
    .compileComponents();
  }));

  describe('with no data', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(ContentTypeButtonComponent);
      component = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeDefined();
    });

    it('should not have any initial input', () => {
      expect(component.contentType).toBeUndefined();
    });
  
    it('should not have any initial DOM', () => {
      const contentTypeButtonElement: HTMLElement = fixture.nativeElement;
      expect(contentTypeButtonElement.innerHTML).toEqual('<!--bindings={}-->');
    });
  });

  describe('with mock data', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(ContentTypeButtonComponent);
      component = fixture.debugElement.componentInstance;
      component.contentType = 
        new ContentType(
          'XYZ',
          'mock data description',
          new ContentTypeIcon(
            'fa-warning',
            '#AF4873'
          )
        );
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeDefined();
    });
  
    it('should have input', () => {
      expect(component.contentType).toBeDefined();
    });
  
    it('should have DOM', () => {
      expect(fixture.nativeElement).not.toEqual('<!--bindings={}-->');
    });

    describe('DOM', () => {
      

    });
  });
});