import { Router } from '@angular/router';
import { UsersService } from './../../@services/users.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-answer',
  imports: [FormsModule],
  templateUrl: './answer.component.html',
  styleUrl: './answer.component.scss'
})
export class AnswerComponent {

  constructor(private usersService: UsersService,
    private router: Router
  ) {}

  userNameAnswer!: string;
  userPhoneAnswer!: number;
  userEmailAnswer!: string;
  userAgeAnswer!: number;

  userAnswer1!: string;

  userAnswer2!: string;

  ngOnInit(): void {
    // this.usersService.userNameService = this.userNameAnswer;

  }

    checkTo(url: string) {
    this.router.navigate([url]);
    this.usersService.userNameService = this.userNameAnswer;
    this.usersService.userPhoneService = this.userPhoneAnswer;
    this.usersService.userEmailService = this.userEmailAnswer;
    this.usersService.userAgeService = this.userAgeAnswer;

    this.usersService.userQuestion1 = this.userAnswer1;

    this.usersService.userQuestion2 = this.userAnswer2;
  }
}
