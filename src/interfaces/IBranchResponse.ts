export interface IBranchResponse{
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
    branches: [{
      companyCode: string,
      companyFullName: string,
      branchTypeCode: string,
      branchCode: string,
      branchName: string,
      codeNameType: string,
      taxesObjectCode: string,
      countryISO2: string,
      address: string,
      latitude: string,
      longitude: string,
      status: boolean
    }]
  }]
}
