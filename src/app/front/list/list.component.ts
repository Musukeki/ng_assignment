import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-list',
  imports: [ FormsModule, MatTableModule, MatPaginatorModule ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})



export class ListComponent implements AfterViewInit {
  displayedColumns: string[] = ['編號', '名稱', '狀態', '開始時間', '結束時間', '結果'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  inputContent!: string;
  newData!: MatTableDataSource<PeriodicElement>; // 不含狀態為'尚未發布'的新資料內容，類型不能是 Array，否則無法觸發換頁功能

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator; // 預設的換頁功能設定，適用預設的 dataSource
    this.newData.paginator = this.paginator; // 新的換頁功能設定，適用新的的 newData
  }

  ngOnInit(): void {
    let filterArr = this.dataSource.data.filter((i) => {
      return i.status != '尚未發布';
    })

    this.newData = new MatTableDataSource(filterArr);
    console.log(this.newData)
  }



}

export interface PeriodicElement {
  number: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  result: boolean
}

const ELEMENT_DATA: PeriodicElement[] = [
  { number: 1, name: '最佳員工', status: '尚未開始', startDate: '2023/11/12', endDate: '2023/11/19', result: false },
  { number: 2, name: '最差員工', status: '進行中', startDate: '2023/11/12', endDate: '2023/11/19', result: true },
  { number: 3, name: '最美員工', status: '已結束', startDate: '2023/11/12', endDate: '2023/11/19', result: true },
  { number: 4, name: '最醜員工', status: '尚未發布', startDate: '2023/11/12', endDate: '2023/11/19', result: true },
  { number: 5, name: '最胖員工', status: '進行中', startDate: '2023/11/12', endDate: '2023/11/19', result: true },
  { number: 6, name: '最有錢員工', status: '進行中', startDate: '2023/11/12', endDate: '2023/11/19', result: true },
  { number: 7, name: '最窮員工', status: '已結束', startDate: '2023/11/12', endDate: '2023/11/19', result: true }
];