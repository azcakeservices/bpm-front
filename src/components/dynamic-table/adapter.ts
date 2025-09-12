import { ColumnDef, CellType } from '../../types/cellType';
import {QuestionDto} from "../../interfaces/question/QuestionType";

function mapUiToCell(t?: string): CellType {
  switch (t) {
    case 'date': return 'date';
    case 'checkbox': return 'bool';
    case 'select': return 'badge';
    case 'image': return 'image';
    case 'email':
    case 'tel':
    case 'text':
    default: return 'text';
  }
}

export function buildColumnsFromQuestions(qs: QuestionDto[]): ColumnDef[] {
  return (qs ?? [])
    .filter(q => q?.isActive !== false)
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    .map(q => ({
      key: q.id,
      label: q.label + (q.isRequired ? ' *' : ''),
      type: mapUiToCell(q.inputType?.type),
    }));
}
