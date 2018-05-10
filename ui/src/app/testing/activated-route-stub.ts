// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// //import { convertToParamMap, ParamMap, Params } from '@angular/router';

// @Injectable()
// export class ActivatedRouteStub {
//     // ActivatedRoute.params is Observable
//     private subject = new BehaviorSubject(this.testParams);
//     params = this.subject.asObservable();

//     // Test parameters
//     private _testParams: {};
//     get testParams() { return this._testParams; }
//     set testParams(params: {}) {
//         this._testParams = params;
//         this.subject.next(params);
//     }

//     // ActivatedRoute.snapshot.params
//     get snapshot() {
//         return { params: this.testParams };
//     }
// }


import { ReplaySubject } from 'rxjs/ReplaySubject';
import { convertToParamMap, ParamMap, Params } from '@angular/router';

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setParamMap()` method to add the next `paramMap` value.
 */
export class ActivatedRouteStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `paramMap` observable
  private subject = new ReplaySubject<ParamMap>();

  constructor(initialParams: Params) {
    this.setParamMap(initialParams);
  }

  /** The mock paramMap observable */
  readonly paramMap = this.subject.asObservable();

  /** Set the paramMap observables's next value */
  setParamMap(params: Params) {
    this.subject.next(convertToParamMap(params));
  };
}
