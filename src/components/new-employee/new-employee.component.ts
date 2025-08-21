import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn, FormGroup } from '@angular/forms';

import { QuestionType } from '../../interfaces/question/QuestionType';
import { EmployeeAddDTO } from '../../interfaces/employee form/EmployeeAddDTO';
import { IInputsTypes } from '../../interfaces/InputsTypes/IInputsTypes';

@Component({
  selector: 'app-new-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-employee.component.html',
  styleUrls: ['./new-employee.component.css'],
})
export class NewEmployeeComponent {
  /** справочник типов (id -> type/label) */
  @Input() inputs: IInputsTypes[] = [];
  /** актуальные вопросы */
  @Input() questions: QuestionType[] = [];
  @Output() saved = new EventEmitter<EmployeeAddDTO>();

  @ViewChild('firstInput') firstInput?: ElementRef<HTMLInputElement>;
  isOpen = false;

  private fb = inject(FormBuilder);
  private resolver?: (value: EmployeeAddDTO | undefined) => void;

  /** кэш соответствия inputTypeId -> type (в нижнем регистре) */
  private inputTypeMap = new Map<string, string>();

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(300)]],
    createdBy: [{ value: '', disabled: true }, [Validators.required]],
    answers: this.fb.group({}) as FormGroup,
  });

  /** открыть модалку */
  open(initial?: Partial<EmployeeAddDTO>): Promise<EmployeeAddDTO | undefined> {
    // карта типов
    this.rebuildTypeMap();

    // сортировка и фильтр
    const sorted = [...(this.questions || [])]
      .filter(q => q.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.questions = sorted;

    // построить/обновить контролы answers под текущие вопросы
    const answersGroup = this.fb.group({});
    for (const q of this.questions) {
      const name = this.controlName(q);
      const validators = this.validatorsFor(q);
      const initialValue = this.initialValueFor(q);
      answersGroup.addControl(name, this.fb.control(initial?.answers?.[q.id] ?? initialValue, validators));
    }
    this.form.setControl('answers', answersGroup);

    // статические поля
    this.form.patchValue({
      firstName: initial?.firstName ?? '',
      createdBy: this.getValueByKey('samAccountName'),
    });

    this.isOpen = true;
    queueMicrotask(() => this.firstInput?.nativeElement?.focus());
    return new Promise(resolve => (this.resolver = resolve));
  }

  /** закрыть модалку */
  close(): void {
    this.isOpen = false;
    this.resolver?.(undefined);
    this.resolver = undefined;
  }

  /** сохранить данные */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const rawAnswers = (this.form.get('answers') as FormGroup).getRawValue() as Record<string, any>;

    // преобразуем { q_<id>: value } -> { <id>: value }
    const answers: Record<string, any> = {};
    for (const [k, v] of Object.entries(rawAnswers)) {
      answers[k.replace(/^q_/, '')] = v;
    }

    const dto: EmployeeAddDTO = {
      firstName: (raw.firstName || '').trim(),
      createdBy: raw.createdBy,
      answers
    };

    this.isOpen = false;
    this.resolver?.(dto);
    this.resolver = undefined;
    this.saved.emit(dto);
  }

  // -------- helpers --------

  /** имя контрола внутри answers */
  controlName(q: QuestionType): string {
    return `q_${q.id}`;
  }

  /** тип UI по справочнику inputs */
  uiType(q: QuestionType): string {
    // реальный тип по inputTypeId; по умолчанию text
    return this.inputTypeMap.get(q.inputTypeId) || 'text';
  }

  private rebuildTypeMap(): void {
    this.inputTypeMap.clear();
    for (const it of this.inputs || []) {
      this.inputTypeMap.set(it.id, (it.type || '').toLowerCase());
    }
  }

  private initialValueFor(q: QuestionType): any {
    return this.uiType(q) === 'boolean' ? false : '';
  }

  private validatorsFor(q: QuestionType): ValidatorFn[] {
    const t = this.uiType(q);
    const v: ValidatorFn[] = [];

    if (q.isRequired) {
      if (t === 'boolean') v.push(Validators.requiredTrue);
      else v.push(Validators.required);
    }

    switch (t) {
      case 'email':
        v.push(Validators.email);
        break;
      case 'tel':
        v.push(Validators.pattern(/^[\d+\-\s()]{6,}$/));
        break;
      case 'number':
        v.push(Validators.pattern(/^-?\d+(\.\d+)?$/));
        break;
      case 'date':
        // можно добавить проверку диапазона
        break;
      case 'image':
        // часто будет file/base64 — оставляем только required при необходимости
        break;
      case 'boolean':
        // requiredTrue уже добавлен
        break;
      default:
        v.push(Validators.maxLength(2000));
        break;
    }
    return v;
  }

  /** достаёт поле из localStorage('user') */
  private getValueByKey(key: string) {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    try {
      const obj = JSON.parse(raw);
      return obj?.[key] ?? '';
    } catch {
      return '';
    }
  }
}
