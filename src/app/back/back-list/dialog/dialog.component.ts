import { SourceDataService } from './../../../@services/source-data.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { HttpClientService } from '../../../@http-clinet/http-clinet.service';
import { DialogModule } from "@angular/cdk/dialog";
import { Router, RouterLink } from '@angular/router';



// 若 OnPush 下覺得提示沒即時更新，可另外：
// import { ChangeDetectorRef } from '@angular/core';

type QuestionType = 'single' | 'multiple' | 'text';

interface QuestionOption {
  id: number | string;
  value: string;
}

interface QuestionItem {
  id: string;
  optionContent: string;
  type: QuestionType;
  isReqired: boolean;     // 先沿用你現在的拼法
  options: QuestionOption[];
}

interface AddQuestData {
  questTitle: string;
  questDesc: string;
  startDate: string;
  endDate: string;
  addContent: {
    optionContent: string;
    type: QuestionType;
    isReqired: boolean;
    options: QuestionOption[];
  };
  questOptions: QuestionItem[];   // ★ 不會再變 never[]
}



@Component({
  selector: 'app-dialog',
  imports: [MatButtonModule, MatDialogModule, MatTabsModule, FormsModule, CommonModule, DialogModule, RouterLink],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {




  constructor(
    private sourceDataService: SourceDataService,
    private dialogRef: MatDialogRef<DialogComponent>,
    private httpClientService: HttpClientService,
    private router: Router
  ) { }

  // 新增問卷內容
  // addQuestData = {
  //   questTitle: '',
  //   questDesc: '',
  //   startDate: '',
  //   endDate: '',
  //   addContent: {
  //     optionContent: '',
  //     type: 'single',
  //     isReqired: false,
  //     options: [
  //       { id: Date.now(), value: '' },
  //       { id: Date.now() + 1, value: '' }
  //     ]
  //   },
  //   questOptions: [
  //     {
  //       id: '',
  //       optionContent: '',
  //       type: 'single',
  //       isReqired: false,
  //     }
  //   ],
  // }

  addQuestData: AddQuestData = {
    questTitle: '',
    questDesc: '',
    startDate: '',
    endDate: '',
    addContent: {
      optionContent: '',
      type: 'single',
      isReqired: false,
      options: [
        { id: Date.now(), value: '' },
        { id: Date.now() + 1, value: '' }
      ]
    },
    // ★ 這裡改成空陣列，第一筆就是真資料
    questOptions: []
  };

  selectedIndex = 0;     // 目前分頁索引
  showBasicTip = false;  // 是否顯示右下角提示
  editingIndex: number | null = null;
  private openingPreview = false;


  trackByOptionId = (_index: number, item: { id?: number | string } | null | undefined) =>
    item?.id ?? _index;

  // 新增問題選項
  addOption() {
    const newId = Date.now() + Math.floor(Math.random() * 1000); // 確保唯一id
    this.addQuestData.addContent.options.push({ id: newId, value: '' });
    // console.log(this.addQuestData);
  }

  addQuestItem() {
    if (!this.validateBeforeAdd()) {
      return; // 不符合條件就中止新增
    }

    const content = this.addQuestData.addContent;

    const newOption: QuestionItem = {
      id: Math.floor(Math.random() * 1e10).toString(),
      optionContent: content.optionContent.trim(),
      type: content.type as QuestionType,
      isReqired: content.isReqired,
      // 單/多選保留選項（順手把 value trim），文字題沒有選項
      options: content.type === 'text'
        ? []
        : (content.options || []).map(o => ({ ...o, value: (o.value ?? '').toString().trim() }))
    };

    this.addQuestData.questOptions = [
      ...this.addQuestData.questOptions,
      newOption
    ];

    // 重置輸入區
    this.addQuestData.addContent = {
      optionContent: '',
      type: 'single',
      isReqired: false,
      options: [
        { id: Date.now(), value: '' },
        { id: Date.now() + 1, value: '' }
      ]
    };
  }




  isBasicFilled(): boolean {
    const { questTitle, questDesc, startDate, endDate } = this.addQuestData;
    return (questTitle ?? '').trim().length > 0 &&
      (questDesc ?? '').trim().length > 0 &&
      !!startDate && !!endDate;
  }

  // 讓按鈕 disabled 的條件
  canAddQuestion(): boolean {
    const c = this.addQuestData.addContent;
    const hasQuestion = (c.optionContent ?? '').toString().trim().length > 0;

    // 題目內容必填（所有題型）
    if (!hasQuestion) return false;

    // 文字題：只要求題目內容即可
    if (c.type === 'text') {
      return true;
    }

    // 單選/多選：至少 2 個選項，且每個都有值
    const opts = c.options || [];
    if (opts.length < 2) return false;

    return opts.every(o => (o?.value ?? '').toString().trim().length > 0);
  }



  submitBtn1() {
    // 先檢查基本資料是否完成（可選，但很實用）
    if (!this.isBasicFilled()) {
      this.showBasicTip = true;
      this.selectedIndex = 0; // 帶回基本資料分頁
      alert('請先完成問卷基本資料');
      return;
    }

    // 沒有任何題目
    if (!this.addQuestData.questOptions || this.addQuestData.questOptions.length === 0) {
      this.selectedIndex = 1; // 切到題目設定分頁
      alert('尚未加入任何問題');
      return;
    }

    const apiUrl = `http://localhost:8080/quiz/create`;

    // ★ 全面檢查：已有題目中是否有「重複選項」
    const dupIdx = this.findFirstQuestionWithDup();
    if (dupIdx !== -1) {
      const q = this.addQuestData.questOptions[dupIdx];
      const title = (q?.optionContent || `第 ${dupIdx + 1} 題`).toString();
      alert(`「${title}」的選項內容不能重複`);
      this.selectedIndex = 1; // 切回題目設定分頁
      return;
    }


    // 把前端題目轉成後端 QuestionVo 需要的格式
    const questionList = (this.addQuestData.questOptions || []).map((q, idx) => {
      // const typeUpper = (q.type || '').toUpperCase(); // 'SINGLE' | 'MULTIPLE' | 'TEXT'
      const typeUpper = (q.type === 'multiple') ? 'MULTI' : (q.type || '').toUpperCase();

      const optionTexts =
        typeUpper === 'TEXT'
          ? []
          : ((q.options || [])
            .map(o => (o?.value ?? '').toString().trim())
            .filter(s => s.length > 0));

      return {
        questionId: idx + 1,
        question: q.optionContent ?? '',
        type: typeUpper,
        required: !!q.isReqired,
        options: optionTexts
      };
    });

    const postData = {
      name: this.addQuestData.questTitle ?? '',
      description: this.addQuestData.questDesc ?? '',
      startDate: this.addQuestData.startDate,
      endDate: this.addQuestData.endDate,
      published: true, // 發佈
      questionList
    };

    // ★ 印出要送到 API 的資料
    console.log('[Submit] postData object:', postData);
    console.log('[Submit] postData JSON:\n', JSON.stringify(postData, null, 2));

    this.httpClientService.postApi(apiUrl, postData).subscribe({
      next: (res: any) => {
        console.log('建立成功:', res);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('建立失敗:', err?.error || err);
      }
    });
  }



  // 產生今天（本地時區）的 YYYY-MM-DD 字串，避免時區造成 off-by-one
  todayStr: string = this.toDateInputValue(new Date());

  // 結束時間的最小可選日：max(開始時間, 今天)
  get endMinStr(): string {
    const s = this.addQuestData.startDate || '';
    return s && s > this.todayStr ? s : this.todayStr;
  }

  // 供 <input type="date"> 用的日期字串
  private toDateInputValue(d: Date): string {
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
  }

  // 使用者變更「開始時間」時觸發
  onStartDateChange() {
    const s = this.addQuestData.startDate;
    // 不得早於今天
    if (s && s < this.todayStr) {
      this.addQuestData.startDate = this.todayStr;
    }
    // 讓結束時間維持 >= 開始時間（若已選結束時間且比開始時間小，就自動調整）
    const endMin = this.endMinStr;
    if (this.addQuestData.endDate && this.addQuestData.endDate < endMin) {
      this.addQuestData.endDate = endMin;
    }
  }

  // 使用者變更「結束時間」時觸發
  onEndDateChange() {
    const endMin = this.endMinStr;
    const e = this.addQuestData.endDate;
    // 不得早於 endMin（= max(開始時間, 今天)）
    if (e && e < endMin) {
      this.addQuestData.endDate = endMin;
    }
  }


  removeOption(index: number) {
    const type = this.addQuestData.addContent.type;
    const opts = this.addQuestData.addContent.options || [];

    // 單選/多選：如果刪掉後會少於 2 個，給提示並中止
    const isChoice = type === 'single' || type === 'multiple';
    if (isChoice && (opts.length <= 2)) {
      alert('選項不可少於兩個');
      return;
    }

    // 允許刪除
    opts.splice(index, 1);
  }

  onAddClick() {
    // 用你已經寫好的驗證：不通過會 alert 並 return
    if (!this.validateBeforeAdd()) return;
    // OK 就真的新增
    this.addQuestItem();
  }

  deleteQuestion(i: number) {
    // 移除第 i 筆
    this.addQuestData.questOptions = this.addQuestData.questOptions.filter((_, idx) => idx !== i);

    // 若當前正在編輯被刪掉的那筆，重置編輯狀態
    if (this.editingIndex === i) {
      this.editingIndex = null;
      this.addQuestData.addContent = {
        optionContent: '',
        type: 'single',
        isReqired: false,
        options: [
          { id: Date.now(), value: '' },
          { id: Date.now() + 1, value: '' }
        ]
      };
    } else if (this.editingIndex !== null && this.editingIndex > i) {
      // 如果刪的是前面的項目，調整編輯索引
      this.editingIndex--;
    }
  }



  onTypeChange() {
    const currentType = this.addQuestData.addContent.type;

    if (currentType === 'single' || currentType === 'multiple') {
      // 切換到單選或多選，預設兩個空選項
      this.addQuestData.addContent = {
        optionContent: '',
        type: currentType,
        isReqired: false,
        options: [
          { id: Date.now(), value: '' },
          { id: Date.now() + 1, value: '' }
        ]
      };
    } else {
      // 切換到文字輸入等類型，清空選項
      this.addQuestData.addContent = {
        optionContent: '',
        type: currentType,
        isReqired: false,
        options: []
      };
    }
  }



  private isNonEmpty(v: any): boolean {
    return (v ?? '').toString().trim().length > 0;
  }

  private validateBeforeAdd(): boolean {
    const c = this.addQuestData.addContent;

    if (!this.isNonEmpty(c.optionContent)) {
      alert('題目內容不能為空');
      return false;
    }

    if (c.type === 'single' || c.type === 'multiple') {
      const opts = c.options || [];
      if (opts.length < 2) {
        alert('選項不可少於兩個');
        return false;
      }
      const hasEmpty = opts.some(o => !this.isNonEmpty(o.value));
      if (hasEmpty) {
        alert('選項內容不能為空');
        return false;
      }
      // ★ 新增：重複檢查（忽略大小寫與前後空白）
      if (this.hasDupInAddContent()) {
        alert('選項內容不能重複');
        return false;
      }
    }

    return true;
  }

  openPreviewInNewTab() {
    const qs = this.addQuestData.questOptions || [];

    // 防呆：沒題目
    if (qs.length === 0) {
      this.selectedIndex = 1;
      alert('尚未加入任何問題');
      return;
    }

    // 防呆：單/多選題少於 2 個有效選項
    const hasChoiceWithoutOptions = qs.some(q => {
      // const t = (q.type || '').toUpperCase();
      const typeUpper = (q.type === 'multiple') ? 'MULTI' : (q.type || '').toUpperCase();

      if (typeUpper === 'TEXT') return false;
      const opts = (q.options || [])
        .map(o => (o?.value ?? '').toString().trim())
        .filter(s => s.length > 0);
      return opts.length < 2;
    });
    if (hasChoiceWithoutOptions) {
      this.selectedIndex = 1;
      alert('尚未加入選項');
      return;
    }

    // ★ 全面檢查：已有題目中是否有「重複選項」
    const dupIdx = this.findFirstQuestionWithDup();
    if (dupIdx !== -1) {
      const q = this.addQuestData.questOptions[dupIdx];
      const title = (q?.optionContent || `第 ${dupIdx + 1} 題`).toString();
      alert(`「${title}」的選項內容不能重複`);
      this.selectedIndex = 1; // 切回題目設定分頁
      return;
    }


    // 組預覽/將送出資料
    const questionList = qs.map((q, idx) => {
      // const typeUpper = (q.type || '').toUpperCase();
      const typeUpper =
        (q.type || '').toLowerCase() === 'multiple' ? 'MULTI' : (q.type || '').toUpperCase();

      const optionTexts =
        typeUpper === 'TEXT'
          ? []
          : ((q.options || [])
            .map(o => (o?.value ?? '').toString().trim())
            .filter(s => s.length > 0));
      return {
        questionId: idx + 1,
        question: q.optionContent ?? '',
        type: typeUpper,
        required: !!q.isReqired,
        options: optionTexts
      };
    });

    const postDataForPreview = {
      name: this.addQuestData.questTitle ?? '',
      description: this.addQuestData.questDesc ?? '',
      startDate: this.addQuestData.startDate ?? '',
      endDate: this.addQuestData.endDate ?? '',
      published: true, // 預覽時我們假設將要發佈的樣子
      questionList
    };

    // ★ 印出「如果送出，會 POST 的資料」
    console.log('[Preview] postData object:', postDataForPreview);
    console.log('[Preview] postData JSON:\n', JSON.stringify(postDataForPreview, null, 2));

    // 預覽頁就沿用同一份資料寫入 localStorage
    const previewId = `quiz_preview_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    try {
      localStorage.setItem(previewId, JSON.stringify(postDataForPreview));
    } catch (e) {
      console.error(e);
      alert('無法開啟預覽：localStorage 容量不足或被封鎖');
      return;
    }

    // const tree = this.router.createUrlTree(['https://musukeki.github.io/back/backPreview'], { queryParams: { previewId } });
    // const url = this.router.serializeUrl(tree);
    // const abs = url.startsWith('http') ? url : `${location.origin}${url}`;

    // const win = window.open(abs, '_blank');
    // if (!win) {
    //   alert('瀏覽器阻擋了彈出視窗，請允許本網站的彈出視窗後再試一次。');
    // }

    const externalUrl = 'https://musukeki.github.io/back/backPreview?previewId=' + previewId;

    const win = window.open(externalUrl, '_blank');
    if (!win) {
      alert('瀏覽器阻擋了彈出視窗，請允許本網站的彈出視窗後再試一次。');
    }
  }





  saveDraft() {
    const apiUrl = `http://localhost:8080/quiz/create`;

    // 沒有任何題目
    if (!this.addQuestData.questOptions || this.addQuestData.questOptions.length === 0) {
      this.selectedIndex = 1;
      alert('尚未加入任何問題');
      return;
    }

    // 有單/多選題但有效選項不足 2 個
    const hasChoiceWithoutOptions = (this.addQuestData.questOptions || []).some(q => {
      // const t = (q.type || '').toUpperCase();
      const typeUpper = (q.type === 'multiple') ? 'MULTI' : (q.type || '').toUpperCase();

      if (typeUpper === 'TEXT') return false;
      const optionTexts = (q.options || [])
        .map(o => (o?.value ?? '').toString().trim())
        .filter(s => s.length > 0);
      return optionTexts.length < 2;
    });
    if (hasChoiceWithoutOptions) {
      this.selectedIndex = 1;
      alert('尚未加入選項');
      return;
    }

    // ★ 全面檢查：已有題目中是否有「重複選項」
    const dupIdx = this.findFirstQuestionWithDup();
    if (dupIdx !== -1) {
      const q = this.addQuestData.questOptions[dupIdx];
      const title = (q?.optionContent || `第 ${dupIdx + 1} 題`).toString();
      alert(`「${title}」的選項內容不能重複`);
      this.selectedIndex = 1; // 切回題目設定分頁
      return;
    }


    // 組 questionList
    const questionList = (this.addQuestData.questOptions || []).map((q, idx) => {
      // const typeUpper = (q.type || '').toUpperCase();
      const typeUpper =
        (q.type || '').toLowerCase() === 'multiple' ? 'MULTI' : (q.type || '').toUpperCase();

      const optionTexts =
        typeUpper === 'TEXT'
          ? []
          : ((q.options || [])
            .map(o => (o?.value ?? '').toString().trim())
            .filter(s => s.length > 0));

      return {
        questionId: idx + 1,
        question: q.optionContent ?? '',
        type: typeUpper,
        required: !!q.isReqired,
        options: optionTexts
      };
    });

    const postData = {
      name: this.addQuestData.questTitle ?? '',
      description: this.addQuestData.questDesc ?? '',
      startDate: this.addQuestData.startDate ?? '',
      endDate: this.addQuestData.endDate ?? '',
      published: false, // 草稿
      questionList
    };

    // ★ 印出要送到 API 的資料
    console.log('[Draft] postData object:', postData);
    console.log('[Draft] postData JSON:\n', JSON.stringify(postData, null, 2));

    this.httpClientService.postApi(apiUrl, postData).subscribe({
      next: (res) => {
        alert('草稿已儲存');
        this.dialogRef.close({ status: 'draftSaved', data: res });
      },
      error: (err) => {
        console.error(err);
        alert('草稿儲存失敗');
      }
    });
  }



  // === 重複檢查工具 ===
  private norm(s: any): string {
    return (s ?? '').toString().trim().toLowerCase();
  }

  private hasDupStrings(values: string[]): boolean {
    const seen = new Set<string>();
    for (const v of values.map(v => this.norm(v))) {
      if (!v) continue;        // 空字串另有驗證，這裡略過
      if (seen.has(v)) return true;
      seen.add(v);
    }
    return false;
  }

  /** 檢查「新增輸入區」addContent 的選項是否重複（僅單/多選） */
  private hasDupInAddContent(): boolean {
    const c = this.addQuestData.addContent;
    if (c.type === 'text') return false;
    const values = (c.options || []).map(o => o?.value ?? '');
    return this.hasDupStrings(values);
  }

  /** 檢查所有已加入題目是否有重複選項；有就回傳第一個違規題目的 index，否則 -1 */
  private findFirstQuestionWithDup(): number {
    const qs = this.addQuestData.questOptions || [];
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      if ((q.type || '').toLowerCase() === 'text') continue;
      const values = (q.options || []).map(o => o?.value ?? '');
      if (this.hasDupStrings(values)) return i;
    }
    return -1;
  }





}
