import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  // 問卷資料
  questionnaireTitleService!: string;
  questionnaireDescService!: string;

  // 填問卷者基本資料
  userNameService!: string;
  userPhoneService!: number;
  userEmailService!: string;
  userAgeService!: number;

  // 填表者問卷輸入每個選項內容
  userQuestData: any = {};
}
