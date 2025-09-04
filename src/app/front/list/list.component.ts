import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, HostListener, ViewChild, inject } from '@angular/core';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SourceDataService } from '../../@services/source-data.service';
import type { PeriodicElement } from '../../@services/source-data.service'; // ★ 用 service 裡的型別，避免型別衝突
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { DialogComponent } from './dialog/dialog.component';
import { MenuComponent } from "../../menu/menu.component";
import { HttpClientService } from '../../@http-clinet/http-clinet.service';

@Component({
  selector: 'app-list',
  imports: [
    FormsModule, MatTableModule, MatPaginatorModule,
    CommonModule, RouterLink, MatButtonModule,
    MatDialogModule, MenuComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() }]
})
export class ListComponent implements AfterViewInit {
  displayedColumns: string[] = ['編號', '名稱', '狀態', '開始日期', '結束日期', '結果'];
  dataSource!: MatTableDataSource<PeriodicElement>;
  newData!: MatTableDataSource<PeriodicElement>; // 用於表格顯示
  filterStartDate!: string;
  filterEndDate!: string;
  inputContent!: string;

  user: any;

  readonly dialog = inject(MatDialog);

  constructor(
    private sourceDataService: SourceDataService,
    private httpClientService: HttpClientService,
    private router: Router,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.user = nav?.extras?.state?.['user'] ?? history.state?.user;
  }

  // === 狀態計算（優先判斷草稿，再判斷時間）===
  today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  status(element: any): '尚未發布' | '尚未開始' | '進行中' | '已結束' {
    // 先看 published（容忍多種後端格式）
    const p = element?.published;
    const isDraft =
      p === false || p === 0 || p === '0' ||
      (typeof p === 'string' && (p.toLowerCase() === 'false' || p.toLowerCase() === 'n'));

    if (isDraft) return '尚未發布';

    // 再用時間判斷
    const t = this.today; // 'YYYY-MM-DD'
    const s = (element.startDate || '').toString().slice(0, 10).replace(/\//g, '-');
    const e = (element.endDate || '').toString().slice(0, 10).replace(/\//g, '-');

    if (t < s) return '尚未開始';
    if (t > e) return '已結束';
    return '進行中';
  }
  // ===============================

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    // 先用 service 內的現有資料建表
    const raw: PeriodicElement[] = this.sourceDataService.sourceData || [];
    this.dataSource = new MatTableDataSource(raw);
    this.newData = new MatTableDataSource(raw);

    this.inputContent = '';

    // 真正打後端，回來後重建表格（不過濾掉草稿）
    this.loadListFromServer();

    console.log("login 帶過來的 user", this.user)
  }

  ngAfterViewInit() {
    if (this.newData) this.newData.paginator = this.paginator;
  }

  selectedIds: (string | number)[] = [];  //勾選到的問卷 id

  onCheckChange(row: any, checked: boolean) {
    row.checked = checked; //讓資料本身也同步（你已經有 [(ngModel)] 其實會同步，這行可留可不留）
    const id = row.id;

    const i = this.selectedIds.indexOf(id);
    if (checked && i === -1) {
      this.selectedIds.push(id);      //勾選時加進陣列
    } else if (!checked && i !== -1) {
      this.selectedIds.splice(i, 1);  //取消勾選時從陣列移除
    }
  }




  refreshTable() {
    const rawData = this.sourceDataService.sourceData;
    this.dataSource = new MatTableDataSource(rawData);
    this.newData = new MatTableDataSource(rawData);
    this.newData.paginator = this.paginator;
  }

  searchByName(): void {
    const keyword = this.inputContent?.trim().toLowerCase() || '';
    let filtered = [...this.sourceDataService.sourceData];

    if (keyword !== '') {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(keyword));
    }
    this.newData = new MatTableDataSource(filtered);
    this.newData.paginator = this.paginator;
  }

  searchByFilters(): void {
    const keyword = this.inputContent?.trim().toLowerCase() || '';
    const start = this.filterStartDate;
    const end = this.filterEndDate;

    let filtered = [...this.sourceDataService.sourceData];

    if (keyword !== '') {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(keyword));
    }

    const formatDate = (dateStr: string): string => dateStr.replaceAll('/', '-');

    if (start) filtered = filtered.filter(item => formatDate(item.startDate) >= start);
    if (end) filtered = filtered.filter(item => formatDate(item.endDate) <= end);

    this.newData = new MatTableDataSource(filtered);
    this.newData.paginator = this.paginator;
  }

  clearFilters(): void {
    this.inputContent = '';
    this.filterStartDate = '';
    this.filterEndDate = '';

    const rawData = this.sourceDataService.sourceData;
    this.newData = new MatTableDataSource(rawData);
    this.newData.paginator = this.paginator;
  }

  private loadListFromServer() {
    const apiUrl = `http://localhost:8080/quiz/getAll`;
    this.httpClientService.getApi(apiUrl).subscribe((res: any) => {

      console.log(res)
      const raw: PeriodicElement[] = res.questionList || [];

      const filtered = raw.filter(item => this.status(item) !== '尚未發布');

      this.sourceDataService.sourceData = raw;
      this.sourceDataService.sourceData = filtered;

      this.dataSource = new MatTableDataSource(filtered);
      this.newData = new MatTableDataSource(filtered);
      this.newData.paginator = this.paginator; // 重建資料來源後要重新指定 paginator

      console.log(this.newData.data);
    });
  }


  checkToLogout(url: string) {
    this.router.navigate([url]);
  }

  isBubbleOpen = false;

  toggleBubble(e: MouseEvent) {
    e.stopPropagation();               // 避免冒泡到 document
    this.isBubbleOpen = !this.isBubbleOpen;
  }

  // 可選：點頁面其它地方自動關閉
  @HostListener('document:click')
  closeBubble() {
    if (this.isBubbleOpen) this.isBubbleOpen = false;
  }



}


// mat-paginator
export function getCustomPaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = '每頁顯示筆數';
  paginatorIntl.nextPageLabel = '下一頁';
  paginatorIntl.previousPageLabel = '上一頁';
  paginatorIntl.firstPageLabel = '第一頁';
  paginatorIntl.lastPageLabel = '最後一頁';

  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `第 0 筆，共 ${length} 筆`;
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `第 ${startIndex + 1} - ${endIndex} 筆，共 ${length} 筆`;
  };

  return paginatorIntl;
}
