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

  userNameAnswer!: string; // 填表者名稱
  userPhoneAnswer!: number; // 填表者電話
  userEmailAnswer!: string; // 填表者信箱
  userAgeAnswer!: number; // 填表者年齡


  // questionnaireTitleAnswer!: string;
  // questionnaireDescAnswer!: string;

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
        questName: '這間超市最吸引您的地方',
        type: 'multiple',
        questList: [
          { name: '環境', code: 'A' },
          { name: '價格', code: 'B' },
          { name: '食物', code: 'C' },
          { name: '距離', code: 'D' }
        ]
      },
      {
        questId: 3,
        isRequired: true,
        questName: '平均一週光顧次數',
        type: 'single',
        questList: [
          { name: '3 次以下', code: 'A' },
          { name: '3 ~ 7 次', code: 'B' },
          { name: '7 次以上', code: 'C' }
        ]
      },
      {
        questId: 4,
        isRequired: true,
        questName: '請簡述這家超市和其他的差異',
        type: 'text',
        textContent: ''
      },
      {
        questId: 5,
        isRequired: true,
        questName: '想對這家超市說的話',
        type: 'text',
        textContent: ''
      },
    ]
  }

  // 使用者填寫的內容
  newArr: Array<any> = [];
  userName!: string;
  userPhone!: string;
  userEmail!: string;
  userAge!: string;
  title!: string;
  startDate!: string;
  endDate!: string;
  description!: string;




  ngOnInit(): void {
    this.title = this.quesData.title;
    this.startDate = this.quesData.startDate;
    this.endDate = this.quesData.endDate;
    this.description = this.quesData.description;


    for(let arr of this.quesData.questArr) {
      this.newArr.push({...arr, singleChoice: '', textContent: '', multipleChoice: []})
    }
    console.log(this.newArr)




  }

  // 多選設定
  onCheckboxChange(event: Event, questionIndex: number, code: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const multipleChoiceArr = this.newArr[questionIndex].multipleChoice;

    if (isChecked) {
      // 如果勾選了，加入陣列（避免重複）
      if (!multipleChoiceArr.includes(code)) {
        multipleChoiceArr.push(code);
      }
    } else {
      // 取消勾選，從陣列移除
      const index = multipleChoiceArr.indexOf(code);
      if (index > -1) {
        multipleChoiceArr.splice(index, 1);
      }
    }
  }


  checkTo(url: string) {
    this.router.navigate([url]);

    this.usersService.userName = this.userName;
    this.usersService.userPhone = this.userPhone;
    this.usersService.userEmail = this.userEmail;
    this.usersService.userAge = this.userAge;

    this.usersService.title = this.title;
    this.usersService.description = this.description;

    this.usersService.userChoiceData = this.newArr
  }
}
