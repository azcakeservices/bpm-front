export interface EmployeeAddDTO {
  firstName: string;
  createdBy: string;
  answers: { [questionId: string]: any };
}
