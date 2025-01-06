export interface IRefundResponse {
  id: number,
  code: number,
  subCode: number,
  message: string,
  data: [{
    id: number,
    companyCode: string,
    companyTIN: string,
    companyFullName: string,
    tin: string,
    fullName: string,
    refundProducts: [{
      companyCode: string | null,
      branchCode: string,
      branchName: string,
      contractCode: string,
      contractName: string,
      chechDate: string,
      cashRegisterCode: string,
      documentNumber: string,
      zNumber: string,
      zNumberTax: string,
      rowNumber: number,
      productCode: string,
      productName: string,
      barcode: string,
      quantity: number,
      measureTyeCode: string,
      refundPrice: number,
      lineTotal: number
    }]
  }]
}
