import { SourceDataService } from './../../../@services/source-data.service';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  imports: [ MatButtonModule, MatDialogModule, MatTabsModule, FormsModule, CommonModule ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {

  constructor(
    private sourceDataService: SourceDataService,
    private dialogRef: MatDialogRef<DialogComponent>
  ) {}

  // 新增問卷內容
  addQuestData = {
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
    questOptions: [
      {
        id: '',
        optionContent: '',
        type: 'single',
        isReqired: false,
      }
    ],
  }

  // 新增問題選項
  addOption() {
    const newId = Date.now() + Math.floor(Math.random() * 1000); // 確保唯一id
    this.addQuestData.addContent.options.push({ id: newId, value: '' });
    // console.log(this.addQuestData);
  }

  // 新增問題
  addQuestItem() {
    const content = this.addQuestData.addContent;

    if (content.type === 'single' || content.type === 'multiple') {
      if (!content.options || content.options.length === 0) {
        alert('請先新增選項');
        return;
      }
    }

    // 新增題目（文字輸入題無 options）
    const newOption = {
      id: Math.floor(Math.random() * 10000000000).toString(),
      optionContent: content.optionContent,
      type: content.type,
      isReqired: content.isReqired,
      options: content.type === 'text' ? [] : content.options
    };

    this.addQuestData.questOptions = [...this.addQuestData.questOptions, newOption];

    // 新增完題目後清空 addContent（type 保留空字串，下一題再選）
    this.addQuestData.addContent = {
      optionContent: '',
      type: 'single',
      isReqired: false,
      options: [
        { id: Date.now(), value: '' },
        { id: Date.now() + 1, value: '' }
      ]
    };

    console.log(this.addQuestData);
  }

  // 新增整份問卷
  submitBtn() {
    let getNumber = 0;
    if(this.sourceDataService.sourceData.length == 0) {
      getNumber = 0;
    } else {
      getNumber = this.sourceDataService.sourceData[this.sourceDataService.sourceData.length - 1 ].number + 1;
    }

    this.sourceDataService.sourceData = [
      ...this.sourceDataService.sourceData,
      {
        number: getNumber,
        name: this.addQuestData.questTitle,
        status: '進行中',
        startDate: this.addQuestData.startDate,
        endDate: this.addQuestData.endDate,
        id: getNumber.toString(),
        checked: false
      }
    ]
    console.log('服務資料', this.sourceDataService.sourceData)
    this.dialogRef.close();

    // console.log(this.sourceDataService.sourceData)
  }

  removeOption(index: number) {
    this.addQuestData.addContent.options.splice(index, 1);
  }

  trackByOptionId(index: number, item: { id: number, value: string }) {
    return item.id;
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

}
