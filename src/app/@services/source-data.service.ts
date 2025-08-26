import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class SourceDataService {

  sourceData: PeriodicElement[] = [
    // { number: 1, name: '咖啡習慣', status: '尚未開始', startDate: '2025-07-18', endDate: '2025-07-24', id: '1', checked: false },
    // { number: 2, name: '超市偏好統計', status: '進行中', startDate: '2025-07-12', endDate: '2025-07-18', id: '2', checked: false },
    // { number: 3, name: '課程滿意度調查', status: '已結束', startDate: '2025-07-09', endDate: '2025-07-15', id: '3', checked: false },
    // { number: 4, name: '最看不順眼的主管', status: '尚未發布', startDate: '2025-07-20', endDate: '2025-07-26', id: '4', checked: false },
    // { number: 5, name: '平台使用習慣', status: '進行中', startDate: '2025-07-13', endDate: '2025-07-19', id: '5', checked: false },
    // { number: 6, name: '內部溝通與協作評估問卷', status: '進行中', startDate: '2025-07-13', endDate: '2025-07-19', id: '6', checked: false },
    // { number: 7, name: 'AA制意見調查', status: '已結束', startDate: '2025-07-10', endDate: '2025-07-16', id: '7', checked: false }
  ];

  constructor() { }
}

export interface PeriodicElement {
  number: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  id: string;
  checked: boolean;
}