import { UsersService } from './../../@services/users.service';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SourceDataService } from '../../@services/source-data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'app-back-list',
  imports: [ FormsModule, MatTableModule, MatPaginatorModule, CommonModule, RouterLink, MatButtonModule, MatDialogModule ],
  templateUrl: './back-list.component.html',
  styleUrl: './back-list.component.scss',
  providers: [
      { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() }
    ]
})
export class BackListComponent {
  displayedColumns: string[] = ['選取操作', '編號', '名稱', '狀態', '開始時間', '結束時間', '結果'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataSource!: MatTableDataSource<PeriodicElement>;

  filterStartDate!: string;
  filterEndDate!: string;


  readonly dialog = inject(MatDialog);

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '700px',
      maxWidth: '700px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      this.refreshTable() // 配合 refreshTable()
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  inputContent!: string;
  newData!: MatTableDataSource<PeriodicElement>; // 不含狀態為'尚未發布'的新資料內容，類型不能是 Array，否則無法觸發換頁功能

  constructor(private sourceDataService: SourceDataService) {}

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator; // 預設的換頁功能設定，適用預設的 dataSource
    this.newData.paginator = this.paginator; // 新的換頁功能設定，適用新的的 newData
  }

  ngOnInit(): void {
    const rawData: PeriodicElement[] = this.sourceDataService.sourceData;
    this.dataSource = new MatTableDataSource(rawData);

    let filterArr = this.dataSource.data.filter((i) => {
      return i.status !== '尚未發布';
    })

    this.newData = new MatTableDataSource(filterArr);

    this.inputContent = '';

    console.log('服務資料', this.sourceDataService.sourceData)
    console.log('原始資料', this.dataSource.data)
    console.log('篩選後資料', this.newData.data)
  }

  deleteData(): void {
    // 過濾掉被勾選的項目
    this.sourceDataService.sourceData = this.sourceDataService.sourceData.filter(item => !item.checked);

    // 更新 dataSource & newData
    this.dataSource = new MatTableDataSource(this.sourceDataService.sourceData);
    const filterArr = this.sourceDataService.sourceData.filter((i) => {
      return i.status !== '尚未發布';
    });
    this.newData = new MatTableDataSource(filterArr);
    this.newData.paginator = this.paginator;

    console.log('服務資料', this.sourceDataService.sourceData)
    console.log('原始資料', this.dataSource.data)
    console.log('篩選後資料', this.newData.data)

    // console.log('newData', this.newData.data)
    // console.log(this.sourceDataService.sourceData);
  }

  // 訂閱 同步渲染畫面
  refreshTable() {
    const rawData = this.sourceDataService.sourceData;
    this.dataSource = new MatTableDataSource(rawData);
    const filterArr = rawData.filter(i => i.status !== '尚未發布');
    this.newData = new MatTableDataSource(filterArr);
    this.newData.paginator = this.paginator;
  }

  searchByName(): void {
    const keyword = this.inputContent?.trim().toLowerCase() || '';

    let filtered = this.sourceDataService.sourceData.filter(item => item.status !== '尚未發布');

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

    // 先排除 '尚未發布'
    let filtered = this.sourceDataService.sourceData.filter(item => item.status !== '尚未發布');

    // 關鍵字搜尋
    if (keyword !== '') {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(keyword));
    }

    // 日期格式轉換 helper
    const formatDate = (dateStr: string): string => {
      return dateStr.replaceAll('/', '-'); // 將 yyyy/MM/dd 轉成 yyyy-MM-dd
    }

    // 日期篩選
    if (start) {
      filtered = filtered.filter(item => formatDate(item.startDate) >= start);
    }

    if (end) {
      filtered = filtered.filter(item => formatDate(item.endDate) <= end);
    }

    // 更新資料並套用分頁
    this.newData = new MatTableDataSource(filtered);
    this.newData.paginator = this.paginator;
  }

  // 清除按鈕
  clearFilters(): void {
    // 清空輸入欄位內容
    this.inputContent = '';
    this.filterStartDate = '';
    this.filterEndDate = '';

    // 重設資料（即重新顯示所有非「尚未發布」的資料）
    const rawData = this.sourceDataService.sourceData;
    const filtered = rawData.filter(i => i.status !== '尚未發布');

    this.newData = new MatTableDataSource(filtered);
    this.newData.paginator = this.paginator;
  }

}

export interface PeriodicElement {
  number: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  id: string;
  checked: boolean;
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
