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

  addOption() {
    // addQuestData.addContent 加入 id 屬性的新物件
    const newOption = {
      id: Math.floor(Math.random() * 10000000000).toString(),
      ...this.addQuestData.addContent
    };

    // 將新物件 newOption 加入 addQuestData.questOptions 陣列中
    this.addQuestData = {
      ...this.addQuestData,
      // questTitle: this.addQuestData.questTitle,
      // questDesc: this.addQuestData.questDesc,
      // startDate: this.addQuestData.startDate,
      // endDate: this.addQuestData.endDate,
      // addContent: {
      //   ...this.addQuestData.addContent,
      //   optionContent: '',
      //   isReqired: false
      // },
      questOptions: [...this.addQuestData.questOptions, newOption]
    };

    console.log(this.addQuestData);
  }

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
        status: '尚未開始',
        startDate: this.addQuestData.startDate,
        endDate: this.addQuestData.endDate,
        id: getNumber.toString(),
        checked: false
      }
    ]

    console.log(this.sourceDataService.sourceData)
  }
}
