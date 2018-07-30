import { ComponentFixture, TestBed  } from '@angular/core/testing';
import { RouterTestingModule,  } from "@angular/router/testing";
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { DocEditPageComponent } from './docedit-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import * as fromRoot from '../../reducers';
import * as Model from '../../core/actions/model.actions';
import * as Documents from '../actions/document.actions';
import * as History from '../actions/history.actions';
import * as Comments from '../../comments/actions/comments.actions';

describe('Document Edit Page', () => {
	let fixture: ComponentFixture<DocEditPageComponent>;
	let store: Store<fromRoot.State>;
	let instance: DocEditPageComponent;
	let routeParams: any = { title: 'testtitle', model: 'testmodel' };

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				RouterTestingModule,
				StoreModule.forRoot({
					models: combineReducers(fromRoot.reducers),
				})
			],
			declarations: [
				DocEditPageComponent
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		});

		fixture = TestBed.createComponent(DocEditPageComponent);
		instance = fixture.componentInstance;
		store = TestBed.get(Store);

		spyOn(store, 'dispatch').and.callThrough();
	});

	it('should compile', () => {
		fixture.detectChanges();
		expect(fixture).toMatchSnapshot();
	});

	// TO DO Find a a proper way to test ngOnInit with queryparams

  it('should dispatch 3 actions on loadDocument', () => {

    const loadDocument = new Documents.Load(routeParams);
		const loadHistory = new History.Load(routeParams);
		const loadComments = new Comments.Load(routeParams.title);

    instance.loadDocument(routeParams);

    expect(store.dispatch).toHaveBeenCalledWith(loadDocument);
    expect(store.dispatch).toHaveBeenCalledWith(loadHistory);
    expect(store.dispatch).toHaveBeenCalledWith(loadComments);
  });

  it('should dispatch 2 actions on loadVersion', () => {
  	let newParams = Object.assign({}, routeParams);
		newParams.version = 'testversion';
		console.log(newParams);
    const loadDocument = new Documents.Load(newParams);
		const setHistoryItem = new History.SetSelectedHistoryItem(newParams.version);

    instance.loadVersion('testversion');

    expect(store.dispatch).toHaveBeenCalledWith(loadDocument);
    expect(store.dispatch).toHaveBeenCalledWith(setHistoryItem);
  });

  it('should dispatch 2 actions on submitDocument', () => {
  	let data = {};
    const submitDoc = new Documents.SubmitDocument(data);
		const loadHistory = new History.Load(routeParams);

    instance.submitDocument(data);

    expect(store.dispatch).toHaveBeenCalledWith(submitDoc);
    expect(store.dispatch).toHaveBeenCalledWith(loadHistory);
  });

});
