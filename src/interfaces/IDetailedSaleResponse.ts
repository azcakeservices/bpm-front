export interface IDetailedSaleResponse {
  id: number,
  code: number,
  subCode: number,
  message: string
  data:[
    id: number,
    companyCode: string,
    companyTIN: string,
    companyFullName: string,
    tin: string,
    fullName: string,
    dailySales: [
      {
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
    ]
  ]
}
