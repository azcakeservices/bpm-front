export type CellType = 'text' | 'number' | 'date' | 'bool' | 'badge' | 'image';

export interface ColumnDef {
  key: string;
  label: string;
  type?: CellType;
  widthPx?: number;
  sticky?: boolean;
  hidden?: boolean;
}

export interface DynamicTableData {
  columns: ColumnDef[];
  rows: Array<Record<string, any>>;
}
