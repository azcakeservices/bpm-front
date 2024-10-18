export interface IDailySale {
  id: number,
  contractCode: string,
  contractName: string,
  branchCode: string,
  branchName: string,
  productCode: string,
  productName: string,
  barcode: string,
  saleDate: string,
  quantity: number,
  price: number,
  total: number
}
