import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { GetUser } from 'app/store/auth/auth.state';

@Component({
	selector: 'med-get-user',
	templateUrl: './get-user.component.html',
	styleUrls: ['./get-user.component.css']
})
export class GetUserComponent implements OnInit {

	constructor(private store: Store) {}

	ngOnInit() {
		this.store.dispatch(new GetUser(true));
	}

}
