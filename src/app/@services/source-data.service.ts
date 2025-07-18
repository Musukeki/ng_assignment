import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class SourceDataService {

  sourceData: PeriodicElement[] = [
    { number: 1, name: '最佳員工', status: '尚未開始', startDate: '2025/07/18', endDate: '2025/07/24', id: '1', checked: false },
    { number: 2, name: '台灣超市比拼調查', status: '進行中', startDate: '2025/07/12', endDate: '2025/07/18', id: '2', checked: false },
    { number: 3, name: '最美員工', status: '已結束', startDate: '2025/07/09', endDate: '2025/07/15', id: '3', checked: false },
    { number: 4, name: '最醜員工', status: '尚未發布', startDate: '2025/07/20', endDate: '2025/07/26', id: '4', checked: false },
    { number: 5, name: '最胖員工', status: '進行中', startDate: '2025/07/13', endDate: '2025/07/19', id: '5', checked: false },
    { number: 6, name: '最有錢員工', status: '進行中', startDate: '2025/07/13', endDate: '2025/07/19', id: '6', checked: false },
    { number: 7, name: '最窮員工', status: '已結束', startDate: '2025/07/10', endDate: '2025/07/16', id: '7', checked: false }
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