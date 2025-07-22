import { SourceDataService } from './../../../@services/source-data.service';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-dialog',
  imports: [ MatButtonModule, MatDialogModule, MatTabsModule, FormsModule ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {

  constructor(private sourceDataService: SourceDataService) {}

  // 新增問卷內容
  addQuestData = {
    questTitle: '',
    questDesc: '',
    startDate: '',
    endDate: '',
    addContent: {
      optionContent: '',
      type: '',
      isReqired: false,
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
    console.log(this.addQuestData)
  }

  // 新增問題
  addQuestItem() {
    // newOption 表示新增的題目並加入 id 屬性
    const newOption = {
      id: Math.floor(Math.random() * 10000000000).toString(),
      ...this.addQuestData.addContent
    };

    // 每次新增都會將新增的題目 newOption 加入 addQuestData.questOptions 陣列中
    this.addQuestData = {
      ...this.addQuestData,
      questOptions: [...this.addQuestData.questOptions, newOption]
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

    // console.log(this.sourceDataService.sourceData)
    console.log('服務資料', this.sourceDataService.sourceData)
  }
}
