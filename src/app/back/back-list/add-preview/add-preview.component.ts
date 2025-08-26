import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-add-preview',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './add-preview.component.html',
  styleUrl: './add-preview.component.scss'
})
export class AddPreviewComponent {

  constructor( private router: Router) {}

  name!: String;
  description!: String;
  startDate!: String;
  endDate!: String;
  published!: true;
  questionList: Array<any> = [];



  ngOnInit() {

  }
}





// postData = {
//   "name": "你是貓派還是狗派？",
//   "description": "貓狗大對決",
//   "startDate": "2025-08-26",
//   "endDate": "2025-08-29",
//   "published": true,
//   "questionList": [
//     {
//       "questionId": 1,
//       "question": "問題一",
//       "type": "SINGLE",
//       "required": true,
//       "options": [
//         "選項一",
//         "選項二"
//       ]
//     },
//     {
//       "questionId": 2,
//       "question": "問題二",
//       "type": "SINGLE",
//       "required": false,
//       "options": [
//         "選項一",
//         "選項二",
//         "選項三"
//       ]
//     }
//   ]
// }