import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // 這是關鍵
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  testAccount!: string;
  testPassword!: string;

  constructor(private router: Router) {}

  login() {
    if (this.testAccount === '001' && this.testPassword === '001') {
      this.router.navigate(['/front/list']);
    } else if (this.testAccount === '000' && this.testPassword === '000') {
      this.router.navigate(['/back/backList']);
    } else {
      alert('F:001/001&B:000/000')
    }
  }
}
