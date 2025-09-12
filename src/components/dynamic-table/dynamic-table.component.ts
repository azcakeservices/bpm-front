import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ColumnDef, DynamicTableData } from '../../types/cellType';
import {DatePipe, DecimalPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";

type SortDir = -1 | 0 | 1;

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css'],
  standalone: true,
  imports: [
    NgSwitchCase,
    DatePipe,
    DecimalPipe,
    NgSwitchDefault,
    NgIf,
    NgSwitch,
    NgForOf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTableComponent {
  @Input() stickyDefaults: { keys: string[] } = { keys: [] };

  private _data: DynamicTableData = { columns: [], rows: [] };

  @Input() set data(v: DynamicTableData) {
    console.log(v)
    this._data = v ?? { columns: [], rows: [] };
    this.visibleColumns = (this._data.columns ?? []).filter(c => !c.hidden);
    this.sortedRows = [...(this._data.rows ?? [])];
    this.sort = { key: '', dir: 0 };
  }
  get data() { return this._data; }

  visibleColumns: ColumnDef[] = [];
  sortedRows: any[] = [];

  sort: { key: string; dir: SortDir } = { key: '', dir: 0 };

  trackByKey = (_: number, c: ColumnDef) => c.key;
  trackByRow = (_: number, r: any) => r?.id ?? r;

  toggleSort(col: ColumnDef): void {
    const key = col.key;
    if (this.sort.key !== key) {
      this.sort = { key, dir: 1 };
    } else {
      this.sort.dir = (this.sort.dir === 1 ? -1 : this.sort.dir === -1 ? 0 : 1);
    }

    if (this.sort.dir === 0) {
      this.sortedRows = [...(this._data.rows ?? [])];
      return;
    }

    const dir = this.sort.dir;
    this.sortedRows = [...(this._data.rows ?? [])].sort((a, b) => {
      const av = a?.[key];
      const bv = b?.[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      const aNum = typeof av === 'number' ? av : Number.isFinite(+av) ? +av : NaN;
      const bNum = typeof bv === 'number' ? bv : Number.isFinite(+bv) ? +bv : NaN;
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return (aNum - bNum) * dir;
      }

      const aDate = new Date(av);
      const bDate = new Date(bv);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return (aDate.getTime() - bDate.getTime()) * dir;
      }

      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  stickyLeft(_col: ColumnDef): number {
    return 0;
  }
}
