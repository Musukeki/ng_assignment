import { SourceDataService } from './../../@services/source-data.service';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from './../../@services/users.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-answer',
  imports: [FormsModule, RouterLink],
  templateUrl: './answer.component.html',
  styleUrl: './answer.component.scss'
})
export class AnswerComponent {

  constructor(
    private usersService: UsersService,
    private router: Router,
    private sourceDataService: SourceDataService
  ) {}

  userNameAnswer!: string;
  userPhoneAnswer!: number;
  userEmailAnswer!: string;
  userAgeAnswer!: number;

  questionnaireTitleAnswer!: string;
  questionnaireDescAnswer!: string;

  userQuestAnswer!: any;

  // 假資料

  quesData = {
    id: 1,
    title: '台灣超市比拼調查',
    startDate: '2025/07/12',
    endDate: '2025/07/18',
    description: '台灣的四大超商指的是：7-11 (統一超商), 全家便利商店, 萊爾富, 和OK 超商。 這些超商在台灣的零售市場中佔據主要地位，提供各種商品和服務，包括日常用品、食品、代收代付、以及包裹取貨等。這些超商不僅是提供日常必需品的場所，也逐漸轉型成為生活服務中心，提供多元化的服務，如代收費用、包裹寄送、影印、提款等，成為台灣民眾生活中不可或缺的一部分。',
    questArr: [
      {
        questId: 1,
        isRequired: true,
        questName: '您最常光顧的超市',
        type: 'single',
        questList: [
          { name: '7-11', code: 'A' },
          { name: '全家', code: 'B' },
          { name: '萊爾富', code: 'C' },
          { name: 'OK', code: 'D' }
        ]
      },
      {
        questId: 2,
        isRequired: true,
        questName: '平均一週光顧次數',
        type: 'multiple',
        questList: [
          { name: '3 次以下', code: 'A' },
          { name: '3 ~ 7 次', code: 'B' },
          { name: '7 次以上', code: 'C' }
        ]
      },
      {
        questId: 3,
        isRequired: true,
        questName: '請簡述這家超市和其他的差異',
        type: 'text',
        textContent: '我不知道'
      },
    ]
  }


  ngOnInit(): void {
    // this.usersService.userNameService = this.userNameAnswer;
    // console.log(this.sourceDataService.sourceData)
  }

    checkTo(url: string) {
    this.router.navigate([url]);
    this.usersService.userNameService = this.userNameAnswer;
    this.usersService.userPhoneService = this.userPhoneAnswer;
    this.usersService.userEmailService = this.userEmailAnswer;
    this.usersService.userAgeService = this.userAgeAnswer;

    this.usersService.userQuestData = this.userQuestAnswer;

    this.usersService.questionnaireTitleService = this.quesData.title;
    this.usersService.questionnaireDescService = this.quesData.description;
  }
}
