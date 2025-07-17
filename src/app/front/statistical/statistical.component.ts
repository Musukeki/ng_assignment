import { Component } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistical',
  imports: [],
  templateUrl: './statistical.component.html',
  styleUrl: './statistical.component.scss'
})
export class StatisticalComponent {

  newData: Array<any> = [];

  quesData = {
    title: '台灣超市比拼調查',
    startDate: '2025/07/12',
    endDate: '2025/07/18',
    questArr: [
      {
        questId: '1',
        questName: '您最常光顧的超市',
        type: 'single',
        labels: ['7-11', '全家', '萊爾富', 'OK'],
        data: [31, 26, 9, 12],
        color: ['red', 'blue', 'green', 'purple']
      },
      {
        questId: '2',
        questName: '這間超市最吸引您的地方',
        type: 'multiple',
        labels: ['環境', '價格', '食物', '距離'],
        data: [18, 9, 11, 27],
        color: ['red', 'blue', 'green', 'purple']
      },
      {
        questId: '3',
        questName: '平均一週光顧次數',
        type: 'single',
        labels: ['3 次以下', '3 ~ 7 次', '7 次以上'],
        data: [18, 9, 11, 27],
        color: ['red', 'blue', 'green']
      },
      {
        questId: '4',
        questName: '請簡述這家超市和其他的差異',
        type: 'text',
        labels: [],
        data: ['活動很多', '店員很親切', '廁所很乾淨'],
        color: ['red', 'blue', 'green']
      },
      {
        questId: '5',
        questName: '想對這家超市說的話',
        type: 'text',
        label: [],
        data: ['請繼續保持', '咖啡真是好喝', '大夜班那個給我注意一點'],
        color: ['red', 'blue', 'green']
      },
    ]
  }


  ngOnInit(): void {

  }


  ngAfterViewInit(): void {

    for(let chart of this.quesData.questArr) {
      // chart.js
      let ctx = document.getElementById(chart.questId) as HTMLCanvasElement;

        let data = {
          labels: chart.labels,
          datasets: [{
            label: chart.label,
            data: chart.data,
            backgroundColor: chart.color,
            hoverOffset: 4
          }]
        };

        const config = {
          type: 'doughnut',
          data: data,
        };
      }
    }

}
