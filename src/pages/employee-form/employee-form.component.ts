import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { QuestionService } from '../../services/question.service';
import { NewEmployeeComponent } from '../../components/new-employee/new-employee.component';
import { FormsModule } from "@angular/forms";
import { DynamicTableComponent } from "../../components/dynamic-table/dynamic-table.component";
import { DynamicTableData } from "../../types/cellType";
import { buildColumnsFromQuestions } from "../../components/dynamic-table/adapter";
import {QuestionDto} from "../../interfaces/question/QuestionType";

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [NewEmployeeComponent, FormsModule, DynamicTableComponent],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  questions: QuestionDto[] = [];
  searchField = '';

  // тестовые ответы
  answers = [
    {
      id: 'emp-1',
      'a33fb721-b36b-44aa-bcd4-64f5c0d19251': 'Elnur',          // Adı
      'c2aa822e-a348-488f-b7ab-77fc5631671d': 'Məhərrəmli',     // Soyadı
      'cbd53381-2e4b-446c-9095-32278c7f29f7': 'elnur@azcake.az',// Email
      '675e790c-87a8-4c0f-b74a-a9e6fa0fdacb': '+994552010101',  // Telefon
      'a6151ba2-f913-4935-a21d-daa73232f2f6': '1993-05-02',     // Təvəllüd (date)
      'f001e674-08f3-4eed-b1d4-355df1f0d553': true,             // Ailə vəziyyəti (checkbox)
      '5d13bc2f-41f0-448d-af43-1adaf2308771': 'siqaret'         // Pis vərdişləri (select)
    }
  ];

  tableData: DynamicTableData = { columns: [], rows: [] };

  @ViewChild('createModal') createModal!: NewEmployeeComponent;

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.questionService.getAll().subscribe({
      next: (data) => {
        this.questions = data ?? [];
        this.rebuildTable();
        this.swalSuccess('Suallar yükləndi');
      },
      error: (e) => this.swalError('Suallar yüklənmədi: ' + e)
    });
  }

  rebuildTable(): void {
    const columns = buildColumnsFromQuestions(this.questions);
    const rows = this.answers.map(r => {
      const filled: Record<string, any> = { ...r };
      for (const col of columns) {
        if (!(col.key in filled)) filled[col.key] = '';
      }
      return filled;
    });

    this.tableData = { columns, rows };
  }

  openCreateModal(): void {
    this.createModal.open();
  }

  search(): void {
    // фильтрация по searchField
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
