import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ng_assignment';

  constructor(private router: Router) {}


  ngOnInit(): void {}


  // // 確認用待刪除
  // checkTo(url: string) {
  //   this.router.navigate([url])
  // }
}
