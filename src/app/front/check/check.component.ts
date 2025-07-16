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

  userQuestCheck!: string;

  questionnaireTitleCheck!: string;
  questionnaireDescCheck!: string;


  ngOnInit(): void {

    this.userNameCheck = this.usersService.userNameService;
    this.userPhoneCheck = this.usersService.userPhoneService;
    this.userEmailCheck = this.usersService.userEmailService;
    this.userAgeCheck = this.usersService.userAgeService;

    this.userQuestCheck = this.usersService.userQuestData;

    this.questionnaireTitleCheck = this.usersService.questionnaireTitleService;
    this.questionnaireDescCheck = this.usersService.questionnaireDescService;
  }

  checkTo(url: string) {
    this.router.navigate([url]);
  }
}
