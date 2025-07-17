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

  userQuestCheck!: string;

  questionnaireTitleCheck!: string;
  questionnaireDescCheck!: string;


  ngOnInit(): void {

    this.userName = this.usersService.userName;
    this.userPhone = this.usersService.userPhone;
    this.userEmail = this.usersService.userEmail;
    this.userAge = this.usersService.userAge;

  }

  checkTo(url: string) {
    this.router.navigate([url]);
  }
}
