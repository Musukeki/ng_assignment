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
      // ▼ 日期格式/邏輯入口修正（只動日期）
      this.quizData.startDate = this.toYMD(this.quizData.startDate);
      this.quizData.endDate = this.toYMD(this.quizData.endDate);

      if (this.quizData.startDate && this.quizData.startDate < this.today) {
        this.quizData.startDate = this.today;
      }
      if (this.quizData.endDate && this.quizData.endDate < (this.quizData.startDate || this.today)) {
        this.quizData.endDate = this.quizData.startDate || this.today;
      }

      this.quizData.questionList = res.questionList;
      this.quizData.questionList.forEach((item: any) => {
        item.options = JSON.parse(item.options);
        if (item.question == null) item.question = '';
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

  // removeOption(qi: number, i: number) {
  //   const q = this.quizData.questionList[qi];
  //   if (Array.isArray(q.options)) {
  //     q.options.splice(i, 1);
  //   }
  // }

  // 插入位置（第幾題之前），進頁面後我會在 getEditData() 設成最後一題之後
  insertPos: number = 1;

  // 插入一題到 insertPos（1-based）
  addQuestionAt() {
    if (!Array.isArray(this.quizData?.questionList)) {
      this.quizData.questionList = [];
    }
    const len = this.quizData.questionList.length;
    const idx = Math.min(Math.max((this.insertPos ?? len + 1) - 1, 0), len);

    const newQ = {
      quizId: Number(this.quizData.quizId),
      questionId: 0,
      question: '',
      type: 'SINGLE',
      required: false,
      options: ['', '']
    };

    this.quizData.questionList.splice(idx, 0, newQ);
    this.reindexQuestions();

    // 新增完之後，讓「插入位置」永遠跳到最後一筆（長度 + 1）
    this.insertPos = this.quizData.questionList.length + 1;
  }


  ensureMinOptions(qi: number, newType: string) {
    if (newType === 'SINGLE' || newType === 'MULTI') {
      const q = this.quizData.questionList[qi];
      if (!Array.isArray(q.options)) q.options = [];
      while (q.options.length < 2) q.options.push('');
    }
  }
  removeQuestion(qi: number) {
    const list = this.quizData?.questionList;
    if (!Array.isArray(list)) return;

    // 至少保留一題
    if (list.length <= 1) {
      alert('至少要保留一題');
      return;
    }

    // （可選）確認一下
    // if (!confirm(`確定刪除第 ${qi + 1} 題嗎？`)) return;

    // 真正刪除
    list.splice(qi, 1);

    // 重新編號 questionId：1..N
    this.reindexQuestions();

    // 調整插入位置，避免超出範圍
    this.insertPos = Math.min(this.insertPos, (list.length || 0) + 1);
  }


  removeOption(qi: number, i: number) {
    const q = this.quizData.questionList[qi];
    if (!Array.isArray(q.options)) return;

    if (q.type === 'SINGLE' || q.type === 'MULTI') {
      if (q.options.length <= 2) {
        alert('選項不可少於兩個');
        return;
      }
    }

    q.options.splice(i, 1);
  }

  // 依目前順序重排 questionId：1..N
  private reindexQuestions() {
    if (!Array.isArray(this.quizData?.questionList)) return;
    this.quizData.questionList.forEach((q: any, i: number) => q.questionId = i + 1);
  }

  getCleanPayloadForSave() {
    const ql = (this.quizData.questionList ?? []).map((q: any) => {
      const base = {
        quizId: Number(this.quizData.quizId),
        questionId: q.questionId,
        question: q.question ?? '',
        type: q.type,
        required: !!q.required,
      };

      if (q.type === 'TEXT') {
        // TEXT 題型：沒有選項 → 傳空陣列
        return {
          ...base,
          options: []  // 保持陣列
        };
      } else {
        const optionsArr = Array.isArray(q.options) ? q.options : [];
        return {
          ...base,
          options: optionsArr  // 保持陣列
        };
      }
    });

    return {
      quizId: Number(this.quizData.quizId),
      name: this.quizData.name ?? '',
      description: this.quizData.description ?? '',
      startDate: this.quizData.startDate ?? '',
      endDate: this.quizData.endDate ?? '',
      questionList: ql
    };
  }

  // 小工具：判斷空白
  private isBlank(x: any): boolean {
    return x == null || String(x).trim() === '';
  }

  // 回傳第一個錯誤訊息；若通過回傳空字串
  // 回傳第一個錯誤訊息；若通過回傳空字串
private validateQuiz(): string {
  // 1) 問卷標題必填
  if (this.isBlank(this.quizData?.name)) {
    return '請將內容填寫完畢：問卷標題不可空白';
  }

  // 2) 每題檢查
  const list = this.quizData?.questionList ?? [];
  if (!Array.isArray(list) || list.length === 0) {
    return '請將內容填寫完畢：至少需要 1 題';
  }

  for (let i = 0; i < list.length; i++) {
    const q = list[i];
    const no = i + 1; // 題號

    // 題目文字
    if (this.isBlank(q?.question)) {
      return `請將內容填寫完畢：第 ${no} 題的題目不可空白`;
    }

    // 單/多選要檢查選項
    if (q?.type === 'SINGLE' || q?.type === 'MULTI') {
      const arr: any[] = Array.isArray(q?.options) ? q.options : [];

      // 至少兩個（再保險一次）
      if (arr.length < 2) {
        return `請將內容填寫完畢：第 ${no} 題至少需要 2 個選項`;
      }

      // 去除空白字元後檢查空值
      const trimmed = arr.map(v => (v ?? '').toString().trim());
      if (trimmed.some(v => v === '')) {
        return `請將內容填寫完畢：第 ${no} 題的選項不可空白`;
      }

      // 檢查重複（以修剪後字串比對）
      const set = new Set(trimmed);
      if (set.size !== trimmed.length) {
        return `選項內容重複：第 ${no} 題的選項不可重複`;
      }
    }
  }

  return ''; // 通過
}


  // 產生 yyyy-MM-dd（給 <input type="date"> 的 min 用）
  get today(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // 確保字串是 yyyy-MM-dd（後端若帶時間戳可切掉）
  private toYMD(x: any): string {
    if (!x) return '';
    return String(x).slice(0, 10);
  }

  // 起始日改動：不可早於今天；結束日若早於起始日，一併拉到起始日
  onStartDateChange(val: string) {
    const start = this.toYMD(val);
    const min = this.today;

    this.quizData.startDate = start && start < min ? min : start;

    const end = this.toYMD(this.quizData.endDate);
    if (end && end < this.quizData.startDate) {
      this.quizData.endDate = this.quizData.startDate;
    }
  }

  // 結束日改動：不可早於起始日（若起始日未填，就不可早於今天）
  onEndDateChange(val: string) {
    const end = this.toYMD(val);
    const floor = this.toYMD(this.quizData.startDate) || this.today;
    this.quizData.endDate = end && end < floor ? floor : end;
  }


  submit() {
    const msg = this.validateQuiz();
    if (msg) {
      alert(msg);
      return;
    }

    // 通過驗證: 組 payload
    const payload = this.getCleanPayloadForSave();
    console.log('update data', payload);

    alert('驗證成功，已在 console.log 輸出 payload');
  }




  showData() {
    const payload = this.getCleanPayloadForSave();
    console.log(payload);
    // this.httpClientService.postApi('/quiz/save', payload).subscribe(...)
  }

  ngOnInit() {
    this.getEditData()
  }

}
