import { Component, OnInit } from '@angular/core'
import { UserStore } from '../../../store'

@Component({
    selector: 'med-get-user',
    templateUrl: './get-user.component.html',
    styleUrls: ['./get-user.component.css'],
})
export class GetUserComponent implements OnInit {
    constructor(private userStore: UserStore) {}

    ngOnInit() {
        this.userStore.fetchUser(true)
    }
}
