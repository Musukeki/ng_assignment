import { Component } from '@angular/core';
import { HttpClientService } from '../../@http-clinet/http-clinet.service';
import { SourceDataService } from '../../@services/source-data.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-edit',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './back-edit.component.html',
  styleUrl: './back-edit.component.scss'
})
export class BackEditComponent {

  title!: String;
  quizData: any = {};
  inputType!: boolean;

  constructor(
    private sourceDataService: SourceDataService,
    private httpClientService: HttpClientService,
    private route: ActivatedRoute,
  ) { }

  // ######## 取得列表頁點擊的問卷內容
  getEditData() {
    const quizId = this.route.snapshot.paramMap.get('elementId');
    const getUrl = `http://localhost:8080/quiz/get_quiz?quizId=${quizId}`;
    this.httpClientService.getApi(getUrl).subscribe((res: any) => {


      this.quizData.quizId = quizId;
      this.quizData.name = res.quiz.name;
      this.quizData.description = res.quiz.description;
      this.quizData.startDate = res.quiz.startDate;
      this.quizData.endDate = res.quiz.endDate;
      this.quizData.questionList = res.questionList;
      this.quizData.questionList.forEach((item: any) => {
        item.options = JSON.parse(item.options);
      })

      console.log(this.quizData)

      this.insertPos = (this.quizData.questionList?.length || 0) + 1;


      // {
      //   "quizId": "104",
      //   "name": "333",
      //   "description": "222",
      //   "startDate": "2025-08-29",
      //   "endDate": "2025-08-29",
      //   "published": false,
      //   "questionList": [
      //     {
      //       "questionId": 1,
      //       "question": "33",
      //       "type": "SINGLE",
      //       "required": true,
      //       "options": [
      //         "33",
      //         "33"
      //       ]
      //     }
      //   ]
      // }
    })
  }

  addOption(qi: number) {
    const q = this.quizData.questionList[qi];
    // 防呆：options 可能是字串或 undefined
    if (typeof q.options === 'string') {
      try { q.options = JSON.parse(q.options); } catch { q.options = []; }
    }
    if (!Array.isArray(q.options)) q.options = [];
    q.options.push(''); // 新增一個空白選項輸入框
  }

  removeOption(qi: number, i: number) {
    const q = this.quizData.questionList[qi];
    if (Array.isArray(q.options)) {
      q.options.splice(i, 1);
    }
  }

  // 插入位置（第幾題之前），進頁面後我會在 getEditData() 設成最後一題之後
insertPos: number = 1;

// 插入一題到 insertPos（1-based）
addQuestionAt() {
  if (!Array.isArray(this.quizData?.questionList)) {
    this.quizData.questionList = [];
  }
  const len = this.quizData.questionList.length;
  // 1-based 轉 0-based，並做邊界保護
  const idx = Math.min(Math.max((this.insertPos ?? len + 1) - 1, 0), len);

  const newQ = {
    questionId: 0,       // 先給 0，等下重排
    question: '',
    type: 'SINGLE',
    required: false,
    options: [''],       // 單/多選預設一個空選項
    textAnswer: ''
  };

  this.quizData.questionList.splice(idx, 0, newQ);
  this.reindexQuestions();
}

removeQuestion(qi: number) {
  if (!Array.isArray(this.quizData?.questionList)) return;

  this.quizData.questionList.splice(qi, 1); // 移除指定索引的題目
  this.reindexQuestions();                  // 重新編號 questionId
}


// 依目前順序重排 questionId：1..N
private reindexQuestions() {
  if (!Array.isArray(this.quizData?.questionList)) return;
  this.quizData.questionList.forEach((q: any, i: number) => q.questionId = i + 1);
}


  showData() {
    console.log(this.quizData)
  }

  ngOnInit() {
    this.getEditData()
  }

}
