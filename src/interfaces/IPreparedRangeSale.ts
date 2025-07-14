export interface IPreparedRangeSale {
  date: string;
  category: string
  sales:
    {
      branchName: string;
      total: number,
    }[]
}
