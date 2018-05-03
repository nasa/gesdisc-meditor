import { Component, DebugElement, Input } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelButtonComponent } from './model-button.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { MaterialModule } from '../../../material';
import { MatButtonModule } from '@angular/material/button'
import { FlexLayoutModule } from '@angular/flex-layout';

describe('ModelButtonComponent', () => {
  let component: ModelButtonComponent;
  let fixture: ComponentFixture<ModelButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelButtonComponent ],
      imports: [MatButtonModule, MaterialModule, FlexLayoutModule, AngularFontAwesomeModule]
    })
    .compileComponents();
  }));

  describe('with no data', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(ModelButtonComponent);
      component = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeDefined();
    });

    it('should not have any initial input', () => {
      expect(component.model).toBeUndefined();
    });
  
    it('should not have any initial DOM', () => {
      const contentTypeButtonElement: HTMLElement = fixture.nativeElement;
      expect(contentTypeButtonElement.innerHTML).toEqual('<!--bindings={}-->');
    });
  });

  xdescribe('with mock data', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(ModelButtonComponent);
      component = fixture.debugElement.componentInstance;
      component.model = {
          name: 'XYZ',
          description: 'mock data description',
          icon: {
            name: 'fa-warning',
            color: '#AF4873'
          }
        };
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeDefined();
    });
  
    it('should have input', () => {
      expect(component.model).toBeDefined();
    });
  
    it('should have DOM', () => {
      expect(fixture.nativeElement).not.toEqual('<!--bindings={}-->');
    });

    describe('DOM', () => {
      

    });
  });
});