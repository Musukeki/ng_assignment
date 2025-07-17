import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  // 問卷資料


  // 填問卷者基本資料
  userName!: string;
  userPhone!: string;
  userEmail!: string;
  userAge!: string;

  title!: string;
  startDate!: string;
  endDate!: string;
  description!: string;

  // 填表者問卷輸入每個選項內容
  userQuestData: any = {};

  userChoiceData!: Array<any>;
}
