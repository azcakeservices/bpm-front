import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionAddDTO } from '../../interfaces/question/QuestionAddDTO';
import {IInputsTypes} from "../../interfaces/InputsTypes/IInputsTypes";

@Component({
  selector: 'app-new-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-question.component.html',
  styleUrls: ['./new-question.component.css'],
})
export class NewQuestionComponent {
  @Input() inputs: IInputsTypes[] = [];
  @Output() saved = new EventEmitter<QuestionAddDTO>();

  @ViewChild('firstInput') firstInput?: ElementRef<HTMLInputElement>;

  isOpen = false;

  private fb = inject(FormBuilder);
  private resolver?: (value: QuestionAddDTO | undefined) => void;

  form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(300)]],
    isRequired: [true],
    createdBy: [{ value: '', disabled: true }, [Validators.required]],
    placeholder: ['', [Validators.required, Validators.maxLength(200)]],
    inputId: ['', [Validators.required]],
  });

  open(initial?: Partial<QuestionAddDTO>): Promise<QuestionAddDTO | undefined> {
    this.form.reset({
      label: initial?.label ?? '',
      isRequired: initial?.isRequired ?? true,
      createdBy: this.getValueByKey('samAccountName'),
      placeholder: initial?.placeholder ?? '',
      inputId: initial?.inputId ?? '',
    });

    this.isOpen = true;
    queueMicrotask(() => this.firstInput?.nativeElement?.focus());
    return new Promise(resolve => (this.resolver = resolve));
  }

  close(): void {
    this.isOpen = false;
    this.resolver?.(undefined);
    this.resolver = undefined;
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const dto: QuestionAddDTO = {
      label: v.label.trim(),
      isRequired: v.isRequired,
      createdBy: v.createdBy.trim(),
      placeholder: v.placeholder.trim(),
      inputId: v.inputId,
    };

    this.isOpen = false;
    this.resolver?.(dto);
    this.resolver = undefined;
  }

  getValueByKey(key: string) {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData[key];
    }
  }
}
