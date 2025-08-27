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

  private previewKey: string | null = null;

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('previewId');
    if (!id) { alert('沒有預覽資料（缺少 previewId）'); return; }
    this.previewKey = id;

    const raw = localStorage.getItem(id);
    if (!raw) { alert('預覽資料不存在或已過期'); return; }

    try {
      const data = JSON.parse(raw);
      this.name = data.name ?? '';
      this.description = data.description ?? '';
      this.startDate = data.startDate ?? '';
      this.endDate = data.endDate ?? '';
      this.published = !!data.published;
      this.questionList = Array.isArray(data.questionList) ? data.questionList : [];

      // ✅ 保險驗證（避免使用者直接輸入網址繞過前端檢查）
      const errors = this.validatePreviewPayload(data);
      if (errors.length) {
        alert(errors.join('\n'));
      }
    } catch (e) {
      console.error('解析預覽資料失敗', e);
      alert('預覽資料格式錯誤');
    }

    // 使用者離開預覽才清暫存
    const cleanup = () => {
      if (this.previewKey) localStorage.removeItem(this.previewKey);
      window.removeEventListener('beforeunload', cleanup);
    };
    window.addEventListener('beforeunload', cleanup);
  }

  // 若你願意也可加上 ngOnDestroy 再保險一次
  // ngOnDestroy() {
  //   if (this.previewKey) localStorage.removeItem(this.previewKey);
  // }

  private validatePreviewPayload(data: any): string[] {
    const errs: string[] = [];
    const qs = Array.isArray(data?.questionList) ? data.questionList : [];

    if (qs.length === 0) errs.push('尚未加入任何問題');

    qs.forEach((q: any, i: number) => {
      const idx = i + 1;
      const tRaw = (q?.type || '').toString().toUpperCase();
// 正規化：前端若傳 MULTIPLE，一律視為 MULTI
const t = (tRaw === 'MULTIPLE') ? 'MULTI' : tRaw;

if (!['SINGLE', 'MULTI', 'TEXT'].includes(t)) {
  errs.push(`第 ${idx} 題：題型不正確（${tRaw}）`);
  return; // 題型錯就不用再檢查選項了
}

if (t !== 'TEXT') {
  const opts = (q?.options || [])
    .map((s: any) => (s ?? '').toString().trim())
    .filter((s: string) => s.length > 0);
  if (opts.length < 2) errs.push(`第 ${idx} 題：尚未加入選項（至少需 2 個有效選項）`);
}

    });

    return errs;
    }
}
