export interface ISale {
  id: number,
  saleDate: Date,
  amount: number,
  branchId: number,
  branch: {
    name: string,
    location: string,
    address: string
  }
}
