export type UiType = 'text' | 'email' | 'tel' | 'date' | 'checkbox' | 'select' | 'image';

export interface InputTypeDto {
  id: string;
  type: UiType;
  label: string;
}

export interface QuestionDto {
  id: string;
  order: number;
  label: string;
  isRequired: boolean;
  placeHolder: string;
  inputTypeId: string;
  createdBy: string;
  createdDate: string;
  isActive: boolean;
  inputType?: InputTypeDto | null;
}
