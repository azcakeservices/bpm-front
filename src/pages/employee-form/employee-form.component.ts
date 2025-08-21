import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';

import { QuestionService } from '../../services/question.service';
import { QuestionType } from '../../interfaces/question/QuestionType';

// ✅ импортируем именно NewEmployeeComponent
import { NewEmployeeComponent } from '../../components/new-employee/new-employee.component';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [NewEmployeeComponent, FormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  questions: QuestionType[] = [];
  searchField = '';

  @ViewChild('createModal') createModal!: NewEmployeeComponent;

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.questionService.getAll().subscribe({
      next: data => {
        // опционально: стабильно сортируем по order
        this.questions = data;
        this.swalSuccess('Suallar yükləndi');
      },
      error: (e) => this.swalError('Suallar yüklənmədi' + e)
    });
  }

  openCreateModal(): void {
    this.createModal.open().then();
  }

  search(): void {
    // здесь твоя логика фильтрации по searchField
  }

  private swalSuccess(text: string): void {
    Swal.fire({
      icon: 'success',
      position: 'top-end',
      showCancelButton: false,
      showConfirmButton: false,
      text,
      timer: 700,
    });
  }

  private swalError(text: string): void {
    Swal.fire({
      icon: 'error',
      position: 'top-end',
      showCancelButton: false,
      showConfirmButton: false,
      text,
      timer: 1200,
    });
  }
}
