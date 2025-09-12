import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

type UiType = 'text' | 'email' | 'tel' | 'date' | 'checkbox' | 'number' | 'select' | 'image';

// Простейший тип вопроса: важны id/label/isRequired/placeHolder и источник типа
export interface QuestionLike {
  id: string;
  label: string;
  isRequired: boolean;
  placeHolder?: string;
  // либо inputType?.type, либо просто type, либо только inputTypeId
  inputType?: { type?: UiType } | null;
  type?: UiType;
  inputTypeId?: string;
}

@Component({
  selector: 'app-new-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-employee.component.html',
  styleUrls: ['./new-employee.component.css']
})
export class NewEmployeeComponent implements OnInit, OnChanges {
  @Input() questions: QuestionLike[] = [];

  isOpen = false;

  form = new FormGroup({
    createdBy: new FormControl<string>('', []),
    answers: new FormGroup<Record<string, FormControl<any>>>({})
  });

  ngOnInit(): void {
    // на случай, если вопросы уже есть к моменту init
    if (this.questions?.length) {
      this.buildAnswersGroup(this.questions);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questions']) {
      this.buildAnswersGroup(this.questions ?? []);
    }
  }

  open(): void {
    this.isOpen = true;
    // можно фокус/скролл настроить при необходимости
  }

  close(): void {
    this.isOpen = false;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    console.log('NEW EMPLOYEE PAYLOAD', payload);
    this.close();
  }

  /** ===== helpers, которые используются в шаблоне ===== */

  controlName(q: QuestionLike): string {
    return q.id;
  }

  uiType(q: QuestionLike): UiType {
    // приоритет: inputType.type -> type -> эвристика по inputTypeId -> text
    const t = q?.inputType?.type ?? q?.type;
    if (t) return t as UiType;

    // если в данных только inputTypeId, можно сопоставить известные id, если хочешь.
    // временно — по умолчанию текст:
    return 'text';
  }

  /** ===== внутренняя сборка FormGroup(answers) ===== */

  private buildAnswersGroup(qs: QuestionLike[]): void {
    const controls: Record<string, FormControl<any>> = {};

    qs.forEach(q => {
      const name = this.controlName(q);
      const type = this.uiType(q);
      const validators = [];

      if (q.isRequired) {
        if (type === 'checkbox') {
          validators.push(Validators.requiredTrue);
        } else {
          validators.push(Validators.required);
        }
      }
      if (type === 'email') {
        validators.push(Validators.email);
      }
      // сюда можно добавить pattern/maxlength и т.п.

      const initial =
        type === 'checkbox' ? false :
          type === 'date' ? null :
            '';

      controls[name] = new FormControl<any>(initial, validators);
    });

    // Переустанавливаем целиком группу answers, чтобы Angular не ругался и не держал старые контролы
    this.form.setControl('answers', new FormGroup(controls));
  }
}
