import { Component } from '@angular/core';
// import Chart from 'chart.js/auto';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { MenuComponent } from "../../menu/menu.component";

@Component({
  selector: 'app-statistical',
  imports: [MenuComponent],
  templateUrl: './statistical.component.html',
  styleUrl: './statistical.component.scss'
})
export class StatisticalComponent {

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
        color: ['#687FE5', '#EBD6FB', '#FEEBF6', '#FCD8CD']
      },
      {
        questId: '2',
        questName: '這間超市最吸引您的地方',
        type: 'multiple',
        labels: ['環境', '價格', '食物', '距離'],
        data: [18, 9, 11, 27],
        color: ['#687FE5', '#EBD6FB', '#FEEBF6', '#FCD8CD']
      },
      {
        questId: '3',
        questName: '平均一週光顧次數',
        type: 'single',
        labels: ['3 次以下', '3 ~ 7 次', '7 次以上'],
        data: [18, 9, 11, 27],
        color: ['#687FE5', '#EBD6FB', '#FEEBF6']
      },
      {
        questId: '4',
        questName: '請簡述這家超市和其他的差異',
        type: 'text',
        labels: [],
        data: ['活動很多', '店員很親切', '廁所很乾淨'],
        color: ['#687FE5', '#EBD6FB', '#FEEBF6']
      },
      {
        questId: '5',
        questName: '想對這家超市說的話',
        type: 'text',
        labels: [],
        data: ['請繼續保持', '咖啡真是好喝', '大夜班那個給我注意一點'],
        color: ['#687FE5', '#EBD6FB', '#FEEBF6']
      },
    ]
  }


ngAfterViewInit(): void {
  for(let arr of this.quesData.questArr) {
    const ctx = document.getElementById(arr.questId) as HTMLCanvasElement;

    const data = {
      labels: arr.labels,
      datasets: [{
        // label: 'My First Dataset',
        data: arr.data as number[],
        backgroundColor: arr.color,
        hoverOffset: 4
      }]
    };

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: data,
      options: {
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }
    };

      if (ctx) {
        new Chart(ctx, config);
      } else {
        console.error('Canvas element not found');
      }
    }
  }
}
