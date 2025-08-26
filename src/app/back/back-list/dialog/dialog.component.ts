import { SourceDataService } from './../../../@services/source-data.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { HttpClientService } from '../../../@http-clinet/http-clinet.service';
import { DialogModule } from "@angular/cdk/dialog";

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
  imports: [MatButtonModule, MatDialogModule, MatTabsModule, FormsModule, CommonModule, DialogModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {




  constructor(
    private sourceDataService: SourceDataService,
    private dialogRef: MatDialogRef<DialogComponent>,
    private httpClientService: HttpClientService
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
    const apiUrl = `http://localhost:8080/quiz/create`;

    // 把前端題目轉成後端 QuestionVo 需要的格式
    const questionList = (this.addQuestData.questOptions || []).map((q, idx) => {
      const typeUpper = (q.type || '').toUpperCase(); // 'SINGLE' | 'MULTIPLE' | 'TEXT'
      const optionTexts =
        typeUpper === 'TEXT'
          ? []
          : ((q.options || [])
              .map(o => (o?.value ?? '').toString().trim())
              .filter(s => s.length > 0));

      return {
        questionId: idx + 1,               // ★ 只用順序，不用前端的隨機 id
        question: q.optionContent ?? '',
        type: typeUpper,
        required: !!q.isReqired,
        options: optionTexts
      };
    });


    const postData = {
      name: this.addQuestData.questTitle ?? '',
      description: this.addQuestData.questDesc ?? '',
      startDate: this.addQuestData.startDate, // 'YYYY-MM-DD'
      endDate: this.addQuestData.endDate,
      published: true,                         // 後端是 boolean：req.isPublished()
      questionList
    };

    console.log('postData =', JSON.stringify(postData, null, 2));

    this.httpClientService.postApi(apiUrl, postData).subscribe({
      next: (res: any) => {
        console.log('建立成功:', res);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('建立失敗:', err?.error || err);
        // 若還是 400，請確認：單/多選有沒有輸入選項文字？type 是否是 SINGLE/MULTIPLE/TEXT？
        // 也可把 Network 面板 Response 的完整錯誤字串貼上，我幫你精準對應。
      }
    });
  }


  // 新增整份問卷
  // submitBtn() {
  //   let getNumber = 0;
  //   if(this.sourceDataService.sourceData.length == 0) {
  //     getNumber = 0;
  //   } else {
  //     getNumber = this.sourceDataService.sourceData[this.sourceDataService.sourceData.length - 1 ].number + 1;
  //   }

  //   this.sourceDataService.sourceData = [
  //     ...this.sourceDataService.sourceData,
  //     {
  //       number: getNumber,
  //       name: this.addQuestData.questTitle,
  //       status: '進行中',
  //       startDate: this.addQuestData.startDate,
  //       endDate: this.addQuestData.endDate,
  //       id: getNumber.toString(),
  //       checked: false
  //     }
  //   ]
  //   console.log('服務資料', this.sourceDataService.sourceData)
  //   this.dialogRef.close();

  //   console.log(this.sourceDataService.sourceData)
  //   console.log(this.addQuestData);
  // }

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

    // 題目文字不可為空（單選、多選、文字題都要有題目）
    if (!this.isNonEmpty(c.optionContent)) {
      alert('題目內容不能為空');
      return false;
    }

    // 單選 / 多選：至少 2 個選項，且每個選項都要有內容
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
    }

    // 文字題不需選項，通過
    return true;
  }




}
