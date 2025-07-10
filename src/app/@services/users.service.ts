import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  userNameService!: string;
  userPhoneService!: number;
  userEmailService!: string;
  userAgeService!: number;

  userQuestion1!: string;

  userQuestion2!: string;
}
