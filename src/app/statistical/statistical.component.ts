import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { HttpClientService } from '../@http-clinet/http-clinet.service';
import { Location } from '@angular/common';
import * as echarts from 'echarts';

@Component({
  selector: 'app-statistical',
  imports: [CommonModule],
  templateUrl: './statistical.component.html',
  styleUrl: './statistical.component.scss',
  standalone: true,
})
export class StatisticalComponent implements AfterViewInit {
  @ViewChildren('chartRef') chartEls!: QueryList<ElementRef<HTMLDivElement>>;
  private charts: echarts.ECharts[] = [];

  quizId: any;
  quizName: any;
  quizData: any[] = [];
  elementFromState: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClientService: HttpClientService,
    private location: Location
  ) { }

  ngOnInit() {

    this.getApiData()
    this.quizName = this.route.snapshot.queryParamMap.get('name');
    console.log(this.quizId)
    console.log(this.quizName)

    // ## this.router.getCurrentNavigation()?.extras?.state
    // 意思：拿「這一次導航」時順便帶的 state。
    // 限制：只有當下點擊導頁的那次有值。如果你按 F5 重整、從書籤直接開，這裡會是 null。
    const navState = this.router.getCurrentNavigation()?.extras?.state
      // ## this.location.getState()
      // 這是 Angular Location 服務包裝的 history.state。
      // 瀏覽器會把你導頁時傳的 state 放進瀏覽器的 session history 裡，直到你換頁或清掉，重新整理還在。
      ?? this.location.getState()
      // ## history.state
      // 這是 瀏覽器原生 API，跟上面其實是一樣的東西。
      // Angular 的 Location.getState() 底層就是呼叫 history.state。
      // 所以通常兩個值會一樣，只是 Location 比較「Angular 風格」。
      ?? history.state;

    // [state]="{ data: element }" 是把資料放進「瀏覽器的歷史紀錄」。
    // 第一次導航 → getCurrentNavigation() 有值。
    // 重整之後 → 只能靠 history.state 或 location.getState()。
    // 所以你用了三種方式「fallback」，就能在各種情況下都抓到。

    // 這種方法只在 html 中使用 [state]="{ data: element }" 這種將整個 element 用到的資料拿過來
    this.elementFromState = (navState as any)?.data ?? null;
    console.log(this.elementFromState)
  }


  getApiData() {
    this.quizId = this.route.snapshot.paramMap.get('elementId');
    let apiUrl = `http://localhost:8080/quiz/statistics?quizId=${this.quizId}`;

    this.httpClientService.postApi(apiUrl, "").subscribe({
      next: (res: any) => {
        // res?. -> 有值且非 null、undifined 就回傳
        // 如果是 null、undifined 就直接回傳 undefined
        // someValue ?? defaultValue -> 如果 someValue 是 null 或 undefined，就回傳 defaultValue
        // 否則就回傳 someValue
        this.quizData = res?.statisticsVoList ?? [];
        console.log("API DATA", this.quizData);

        // 圖表專用
        requestAnimationFrame(() => this.initAllCharts());
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  // 當 view 初始化完成，或 quizData 渲染導致 chartEls 變更時，建立圖表
  ngAfterViewInit() {
    // quizData 首次渲染
    this.initAllCharts();

    // 之後 quizData 變動（例如 API 回來、篩選）也會觸發
    this.chartEls.changes.subscribe(() => this.initAllCharts());

    // 視窗縮放自適應
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.disposeAll();
  }

  // ▶ 你取得/更新 quizData 後，不需要手動呼叫任何東西；
  //   只要讓 *template* 重新渲染，chartEls.changes 會自動觸發 initAllCharts()
  //   若你是一次性塞資料，也可在 subscribe 的 next() 結尾，加上一行 setTimeout(() => this.initAllCharts());

  private initAllCharts() {
    // 先清掉舊的，避免重複 init
    this.disposeAll();

    // 為每個 chart 容器建立一個實例
    this.chartEls.forEach((el, idx) => {
      const inst = echarts.init(el.nativeElement);
      inst.setOption(this.buildPieOption(this.getPieDataByIndex(idx)));
      this.charts.push(inst);
    });
  }

  private disposeAll() {
    this.charts.forEach(c => c.dispose());
    this.charts = [];
  }

  private handleResize = () => {
    this.charts.forEach(c => c.resize());
  };

  private getPieDataByIndex(i: number): Array<{ name: string; value: number }> {
    const q = this.quizData[i];
    const list: any[] = Array.isArray(q?.optionCountVoList) ? q.optionCountVoList : [];

    const data = list.map((x) => ({
      name: String(x?.option ?? ''),
      value: Number(x?.count ?? 0),
    }));

    console.log(`[pieData #${i}]`, data);
    return data;
  }


  private buildPieOption(data: { name: string; value: number }[]): echarts.EChartsOption {
    const total = data.reduce((s, d) => s + (Number.isFinite(d.value) ? d.value : 0), 0);
    const safe = total > 0 ? data : [{ name: '暫無資料', value: 1 }];

    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}（{d}%）' },
      legend: {
        orient: 'vertical',
        left: 6,
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10
      },
      series: [{
        type: 'pie',
        name: '統計',
        radius: ['28%', '60%'],
        center: ['61%', '50%'],   // 往右挪，給左側 legend 空間
        minAngle: 3,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        // 外標籤但做避讓 + 縮短引導線
        label: {
          show: true,
          width: 110,               // 給一個寬度，才有「是否溢出」的判斷基準
          overflow: 'truncate',     // 'truncate' | 'break' | 'breakAll' | 'none'
          ellipsis: '…',            // 可自訂省略符（可不寫，預設 '...'）
          formatter: '{b|{b}}\n{c}（{d}%）',
          rich: {
            b: { lineHeight: 14 }   // ← rich 裡可以放 lineHeight / fontSize…但不能放 overflow
          }
        },

        labelLine: { show: true, length: 8, length2: 8 },
        // ECharts 5：避免重疊
        labelLayout: { hideOverlap: true },
        emphasis: {
          scale: true, scaleSize: 6,
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.25)' }
        },
        data: safe
      }]
    };
  }

  backBtn() {
    this.location.back()
  }



}
