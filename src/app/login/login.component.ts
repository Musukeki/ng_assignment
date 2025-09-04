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
  showPassword: boolean = false;

  // 指定管理者帳密清單
  private static readonly ADMIN_LIST = new Map<string, string>([
    ['super01@gmail.com', '88888888'],
    ['super02@gmail.com', '88888888'],
    // 需要幾組就加幾組
  ]);


  constructor(private router: Router, //
    private httpClientService: HttpClientService) {}

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

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
  // 判斷是否是管理者
  private isAdminInput(): boolean {
    const expectedPwd = LoginComponent.ADMIN_LIST.get((this.account || '').trim());
    return !!expectedPwd && expectedPwd === (this.password || '');
  }

  login() {
    const apiUrl = `http://localhost:8080/user/logins`;
    const postData = { email: this.account, password: this.password };

    this.httpClientService.postApi(apiUrl, postData).subscribe((res: any) => {
      // 這裡假設 res.code == 200 表成功，且可能有 res.user.role 之類的欄位
      if (res?.code == 200) {
        alert("登入成功");
        // 記住帳號
        if (this.rememberMe) localStorage.setItem('rememberedAccount', this.account);
        else localStorage.removeItem('rememberedAccount');

        // ✅ 兩種條件都支援：
        // 1) 前端白名單帳密（你指定的）
        // 2) 後端真的回傳角色（更安全，若有的話）
        const backendIsAdmin = (res?.user?.role === 'ADMIN' || res?.user?.isAdmin === true);
        const shouldGoAdmin = this.isAdminInput() || backendIsAdmin;

        if (shouldGoAdmin) {
          // 👉 A 頁面（後台）路由，依你的實際路由調整
          this.router.navigate(['back/backList'], { state: { user: res.user } });
        } else {
          // 👉 不是管理者 → 走原本前台
          this.router.navigate(['front/list'], { state: { user: res.user } });
        }
      } else {
        alert('帳號或密碼錯誤');
      }
    });
  }

  // login() {
  //   // let apiUrl = `http://localhost:8080/user/login`;
  //   let apiUrl = `http://localhost:8080/user/logins`;

  //   const postData = {
  //     email: this.account,
  //     password: this.password
  //   };
  //   this.httpClientService.postApi(apiUrl, postData).subscribe((res: any) => {

  //     console.log(res);
  //     // alert(res.code + res.message)

  //     if (res.code == 200) {
  //       alert("登入成功")
  //       // 記住帳號
  //       if (this.rememberMe) {
  //         localStorage.setItem('rememberedAccount', this.account);
  //       } else {
  //         localStorage.removeItem('rememberedAccount');
  //       }
  //       this.router.navigate(["front/list"], {state: {user: res.user}});

  //     } else {
  //       alert("帳號或密碼錯誤")
  //     }


  //   })

  // }

}
