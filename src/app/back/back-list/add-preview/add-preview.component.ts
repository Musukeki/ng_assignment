import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-preview',
  standalone: true,
  imports: [],
  templateUrl: './add-preview.component.html',
  styleUrl: './add-preview.component.scss'
})
export class AddPreviewComponent {
  constructor(private route: ActivatedRoute, private router: Router) {}

  name = '';
  description = '';
  startDate = '';
  endDate = '';
  published = true;
  questionList: Array<any> = [];

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('previewId');
    if (!id) { alert('沒有預覽資料（缺少 previewId）'); return; }

    const raw = localStorage.getItem(id);
    if (!raw) { alert('預覽資料不存在或已過期'); return; }

    try {
      const data = JSON.parse(raw);
      this.name        = data.name ?? '';
      this.description = data.description ?? '';
      this.startDate   = data.startDate ?? '';
      this.endDate     = data.endDate ?? '';
      this.published   = !!data.published;
      this.questionList = Array.isArray(data.questionList) ? data.questionList : [];
    } catch (e) {
      console.error('解析預覽資料失敗', e);
      alert('預覽資料格式錯誤');
    }

    // ✅ 等使用者關閉或離開預覽頁再清掉該筆暫存
    const cleanup = () => localStorage.removeItem(id);
    window.addEventListener('beforeunload', cleanup);
    // 若你有路由守衛/其他生命週期，也可以在 ngOnDestroy 清：
    // ngOnDestroy(){ localStorage.removeItem(id); }
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