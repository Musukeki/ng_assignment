import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientService } from '../@http-clinet/http-clinet.service';

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

  account!: string;
  password!: string;
  rememberMe: boolean = false;

  constructor(private router: Router, //
    private httpClientService: HttpClientService) { }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedAccount');
    if (savedEmail) {
      this.account = savedEmail;
      this.rememberMe = true;
    }
  }
  toggleRememberMe(): void {
    this.rememberMe = !this.rememberMe;
  }

  login() {
    let apiUrl = `http://localhost:8080/user/login`;

    const postData = {
      email: this.account,
      password: this.password
    };
    this.httpClientService.postApi(apiUrl, postData).subscribe((res: any) => {

      console.log(res);
      // alert(res.code + res.message)

      if (res.code == 200) {
        alert("登入成功")
        // 記住帳號
        if (this.rememberMe) {
          localStorage.setItem('rememberedAccount', this.account);
        } else {
          localStorage.removeItem('rememberedAccount');
        }
        this.router.navigateByUrl("front/list");

      } else {
        alert("帳號或密碼錯誤")
      }
    })

  }

}
