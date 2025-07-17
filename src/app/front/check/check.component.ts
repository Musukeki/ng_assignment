import { Router } from '@angular/router';
import { UsersService } from './../../@services/users.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-check',
  imports: [],
  templateUrl: './check.component.html',
  styleUrl: './check.component.scss'
})
export class CheckComponent {
  constructor(private usersService: UsersService,
    private router: Router
) {}

  userName!: string;
  userPhone!: string;
  userEmail!: string;
  userAge!: string;
  title!: string;
  description!: string;

  userQuestData!: any; // 使用者填寫的問卷資料

  userChoiceData!: Array<any>;


  ngOnInit(): void {

    this.userName = this.usersService.userName;
    this.userPhone = this.usersService.userPhone;
    this.userEmail = this.usersService.userEmail;
    this.userAge = this.usersService.userAge;

    this.title = this.usersService.title;
    this.description = this.usersService.description;

    this.userChoiceData = this.usersService.userChoiceData;

    console.log(this.userChoiceData)
  }

  checkTo(url: string) {
    this.router.navigate([url]);
  }
}
