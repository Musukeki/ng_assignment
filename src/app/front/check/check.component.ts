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

  userNameCheck!: string;
  userPhoneCheck!: number;
  userEmailCheck!: string;
  userAgeCheck!: number;

  userAnswer1Check!: string;

  userAnswer2Check!: string;

  ngOnInit(): void {

    this.userNameCheck = this.usersService.userNameService;
    this.userPhoneCheck = this.usersService.userPhoneService;
    this.userEmailCheck = this.usersService.userEmailService;
    this.userAgeCheck = this.usersService.userAgeService;
    this.userAnswer1Check = this.usersService.userQuestion1;
    this.userAnswer2Check = this.usersService.userQuestion2;
  }

  checkTo(url: string) {
    this.router.navigate([url]);
  }
}
