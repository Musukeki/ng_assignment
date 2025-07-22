import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SourceDataService } from '../../@services/source-data.service';

@Component({
  selector: 'app-list',
  imports: [ FormsModule, MatTableModule, MatPaginatorModule, CommonModule, RouterLink ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  standalone: true, // Angular 17+ 要加上否則 @if 會有問題
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() }
  ]
})

export class ListComponent implements AfterViewInit {
  displayedColumns: string[] = ['編號', '名稱', '狀態', '開始時間', '結束時間', '結果'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataSource!: MatTableDataSource<PeriodicElement>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  inputContent!: string;
  newData!: MatTableDataSource<PeriodicElement>; // 不含狀態為'尚未發布'的新資料內容，類型不能是 Array，否則無法觸發換頁功能

  // 日期搜尋變數
  originalData!: PeriodicElement[];
  startDateFilter!: string; // 綁定開始日期字串 (yyyy-MM-dd)
  endDateFilter!: string;   // 綁定結束日期字串 (yyyy-MM-dd)

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

    this.originalData = filterArr;

    //console.log('原始資料', this.dataSource.data)
    //console.log('篩選後資料', this.newData.data)

    // 搜尋行為設定
    this.newData.filterPredicate = (data: PeriodicElement, filter: string) => {
      return data.name.toLowerCase().includes(filter);
    };
  }

  // 即時搜尋
  applyFilter(filterValue: string) {
    this.newData.filter = filterValue.trim().toLowerCase();
  }

  // 日期搜尋
  dateSearch() {
    const keyword = this.inputContent?.trim() ?? '';

    // 將 startDateFilter, endDateFilter 字串轉成 Date，方便比較
    const startFilterDate = this.startDateFilter ? new Date(this.startDateFilter) : null;
    const endFilterDate = this.endDateFilter ? new Date(this.endDateFilter) : null;

    // 篩選邏輯
    const filtered = this.originalData.filter((item: PeriodicElement) => {
      const itemStartDate = new Date(item.startDate);
      const itemEndDate = new Date(item.endDate);

      // 日期區間判斷（符合開始時間與結束時間都要符合）
      const dateMatch = (
        (!startFilterDate || itemStartDate >= startFilterDate) &&
        (!endFilterDate || itemEndDate <= endFilterDate)
      );

      // 文字關鍵字判斷（名稱包含輸入文字）
      const keywordMatch = keyword ? item.name.includes(keyword) : true;

      return dateMatch && keywordMatch;
    });

    this.newData.data = filtered;
  }

  // 清除搜尋欄位
  clearFilters() {
    // 清空搜尋條件
    this.inputContent = '';
    this.startDateFilter = '';
    this.endDateFilter = '';

    // 還原原始資料
    this.newData = new MatTableDataSource<PeriodicElement>([...this.originalData]);

    // 重新綁定 paginator
    this.newData.paginator = this.paginator;

    // 重設搜尋條件行為（name 關鍵字）
    this.newData.filterPredicate = (data: PeriodicElement, filter: string) => {
      return data.name.toLowerCase().includes(filter);
    };

    // 強制更新資料表
    this.newData._updateChangeSubscription();
  }

}

export interface PeriodicElement {
  number: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  id: string;
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
