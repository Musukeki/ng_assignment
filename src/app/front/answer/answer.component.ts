import { SourceDataService } from './../../@services/source-data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from './../../@services/users.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from "../../menu/menu.component";
import { HttpClientService } from '../../@http-clinet/http-clinet.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-answer',
  imports: [FormsModule, RouterLink, MenuComponent, CommonModule],
  templateUrl: './answer.component.html',
  styleUrl: './answer.component.scss'
})
export class AnswerComponent {

  isActive: boolean = false;

  quizData: any = {};
  user: any;
  answers = {
    text: {} as Record<number, string>,
    single: {} as Record<number, string>,
    multi: {} as Record<number, Set<string>>,
  };

  invalid: Record<number, string> = {};
  postData!: {
    quizId: any;
    email: any;
    questionAnswerVoList: any;
  };

  constructor(
    private usersService: UsersService,
    private router: Router,
    private sourceDataService: SourceDataService,
    private route: ActivatedRoute,
    private httpClientService: HttpClientService,
    private location: Location
  ) {
    const nav = this.router.getCurrentNavigation();
    this.user = nav?.extras?.state?.['user'];
  }

  ngOnInit() {
    // const id = this.route.snapshot.queryParamMap.get('previewId');
    this.getFillinData();

    this.user = this.router.getCurrentNavigation()?.extras?.state?.['user']
      ?? history.state?.user; // F5 或直接進入時用這個
    const quizId = this.route.snapshot.paramMap.get('elementId');
    console.log('USER', this.user, 'quizId', quizId);
  }

  // ######## 取得列表頁點擊的問卷內容
  getFillinData() {
    const quizId = this.route.snapshot.paramMap.get('elementId');
    const getUrl = `http://localhost:8080/quiz/get_quiz?quizId=${quizId}`;
    this.httpClientService.getApi(getUrl).subscribe((res: any) => {

      this.quizData.id = res.quiz.id;
      this.quizData.name = res.quiz.name;
      this.quizData.description = res.quiz.description;
      this.quizData.startDate = res.quiz.startDate;
      this.quizData.endDate = res.quiz.endDate;

      this.quizData.questionList = res.questionList;

      this.quizData.questionList.forEach((i: any) => {
        i.options = JSON.parse(i.options);

      })
      console.log(this.quizData)
    })
  }

  toggleMulti(qid: number, opt: string, checked: boolean) {
    if (!this.answers.multi[qid]) this.answers.multi[qid] = new Set<string>();
    checked ? this.answers.multi[qid].add(opt) : this.answers.multi[qid].delete(opt);
  }

  beforeSubmit() {
    this.invalid = {};
    let hasError = false;


    for (const q of this.quizData.questionList) {
      if (!q.required) continue;
      const id = q.questionId;

      if (q.type === 'TEXT') {
        const v = this.answers.text[id]?.trim();
        if (!v) { this.invalid[id] = '此題為必填'; hasError = true; }
      } else if (q.type === 'SINGLE') {
        if (!this.answers.single[id]) { this.invalid[id] = '請選擇一個選項'; hasError = true; }
      } else if (q.type === 'MULTI') {
        if (!this.answers.multi[id] || this.answers.multi[id].size === 0) {
          this.invalid[id] = '至少勾選一個選項'; hasError = true;
        }
      }
    }

    if (hasError) {
      // 捲到第一題錯誤
      const first = Number(Object.keys(this.invalid)[0]);
      document.querySelector(`[data-qid="${first}"]`)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const fillinData = this.quizData.questionList.map((q: any) => {
      const id = q.questionId;

      let answerList: string[] = [];

      if (q.type === 'MULTI') {
        answerList = Array.from(this.answers.multi[id] ?? []);
      } else if (q.type === 'TEXT') {
        const v = this.answers.text[id]?.toString().trim();
        answerList = v ? [v] : [];
      } else {
        const v = this.answers.single[id];
        const s = v != null ? v.toString().trim() : '';
        answerList = s ? [s] : [];
      }

      // 轉字串、去空白、過濾空值
      answerList = answerList.map(x => (x ?? '').toString().trim()).filter(x => x !== '');

      return { questionId: id, answerList };
    });


    console.log('fillinData', fillinData);

    const postData = {
      quizId: this.quizData.id,
      email: this.user.email,
      questionAnswerVoList: fillinData
    };
    console.log("POST DATA", postData)

    this.postData = postData;

    this.isActive = !this.isActive;

    // this.http.post(..., payload).subscribe(...)

  }

  submit() {
    const postData = this.postData;
    const postUrl = `http://localhost:8080/quiz/fillin`;
    this.httpClientService.postApi(postUrl, postData).subscribe((res: any) => {

      console.log(res);
      if(res.code == 200) {
        alert("填寫完畢，已送出!")
        this.isActive = false;
        this.location.back();
      }
    })

  }

  // TS：型別安全拿 checked（避免你先前那個錯誤）
  onMultiChange(ev: Event, qid: number, opt: string) {
    const input = ev.target as HTMLInputElement | null;
    const checked = !!input?.checked;
    this.toggleMulti(qid, opt, checked);
  }



  backToList() {
    this.location.back();
  }
}
