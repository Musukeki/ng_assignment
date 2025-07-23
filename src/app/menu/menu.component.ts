import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true, // 需要這一行，才可以用 imports 陣列
  imports: [RouterOutlet, RouterLink], // 只能放 directive、pipe 或 standalone component
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'] // 注意是 style**Urls**
})
export class MenuComponent {
  constructor(private router: Router) {} // 把 Router 放 constructor 注入

  // checkTo(url: string) {
  //   this.router.navigate([url]);
  // }

  checkTo(url: string) {
    const currentUrl = this.router.url;

    if (currentUrl.startsWith('/back')) {
      this.router.navigate(['/back/backList']);
    } else if (currentUrl.startsWith('/front')) {
      this.router.navigate(['/front/list']);
    }
  }

  checkToLogout(url: string) {
    this.router.navigate([url]);
  }
}
