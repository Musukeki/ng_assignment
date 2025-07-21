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
  styleUrl: './back-list.component.scss'
})
export class BackListComponent {
  displayedColumns: string[] = ['選取操作', '編號', '名稱', '狀態', '開始時間', '結束時間', '結果'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataSource!: MatTableDataSource<PeriodicElement>;

  readonly dialog = inject(MatDialog);

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '700px',
      maxWidth: '700px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
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

    // console.log('原始資料', this.dataSource.data)
    // console.log('篩選後資料', this.newData.data)


  }

  deleteData(): void {
    // 先從 sourceData 過濾掉被選取的資料
    this.dataSource.data = this.dataSource.data.filter(item => !item.checked);
    let filterArr = this.dataSource.data.filter((i) => {
      return i.status !== '尚未發布';
    })
    this.newData = new MatTableDataSource(filterArr);
    this.sourceDataService.sourceData = this.dataSource.data;
    this.newData.paginator = this.paginator;

    // console.log(this.dataSource.data)
    console.log(this.sourceDataService.sourceData)
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
