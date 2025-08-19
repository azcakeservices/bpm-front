import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputCreateResult } from '../../types/InputCreateResult';

interface InputTypeItem {
  name: string;
  type: string;
}

@Component({
  selector: 'app-new-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-input.component.html',
  styleUrls: ['./new-input.component.css'] // plural безопаснее
})
export class NewInputComponent {
  @Input() inputTypes: InputTypeItem[] = [
    { name: 'tarix',   type: 'date'  },
    { name: 'email',   type: 'email' },
    { name: 'şəkil',   type: 'image' },
    { name: 'rəqəm',   type: 'number'},
    { name: 'telefon', type: 'tel'   },
    { name: 'mətn',    type: 'text'  },
    { name: 'seçim (hə/yox)', type: 'checkbox'},
    { name: 'siyahı', type: 'select' }
  ];
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;

  isOpen = false;
  private resolver?: (value: InputCreateResult | undefined) => void;
  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(128)]],
    type: ['', Validators.required],
  });


  open(initial?: Partial<InputCreateResult>): Promise<InputCreateResult | undefined> {
    this.form.reset({
      name: initial?.name ?? '',
      type: initial?.type ?? '',
    });
    this.isOpen = true;
    queueMicrotask(() => this.nameInput?.nativeElement?.focus());
    return new Promise(resolve => (this.resolver = resolve));
  }

  close() {
    this.isOpen = false;
    this.resolver?.(undefined);
    this.resolver = undefined;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const result = this.form.getRawValue() as InputCreateResult;
    this.isOpen = false;
    this.resolver?.(result);
    this.resolver = undefined;
  }
}
