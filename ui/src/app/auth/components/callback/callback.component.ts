import { Component, OnInit } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'med-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  code: string;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
    });
    window.location.href = environment.API_BASE_PATH + '/login?code=' + this.code;
  }

}
