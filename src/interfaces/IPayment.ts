export interface IPayment {
  branchName: string,
  productCode: number,
  productName: string,
  productBarcode: string,
  sellsCount: number,
  sellsReturnCount: number,
  sellsCountNet: number,
  sellsReturnCountAst: number,
  sellsCountNetAst: number,
  purchaseCountNetAst: number,
  birimCode: string,
  statementDate: string
}
