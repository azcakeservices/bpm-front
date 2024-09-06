export interface IPayment {
  branchName: string,
  productCode: number,
  productName: string,
  productBarcode: number,
  sellsCount: number,
  sellsReturnCount: number,
  sellsCountNet: number,
  sellsReturnCountAst: number,
  sellsCountNetAst: number,
  birimCode: string,
  statementDate: string
}
