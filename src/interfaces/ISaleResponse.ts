import {ISaleData} from "./ISaleData";

export interface ISaleResponse {
  id: number,
  code: number,
  subCode: number,
  message: string,
  data: ISaleData[]
}
