
export interface ISaleOfRentalDailyTotal {
  id: number,
  code: number,
  subCode: number,
  message: string,
  data: [{
    id: number,
    sales: [{
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
      total: number,
    }]
  }]
}
