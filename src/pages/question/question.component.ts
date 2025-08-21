import {Component, OnInit, ViewChild} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NewQuestionComponent } from "../../components/new-question/new-question.component";
import {QuestionService} from "../../services/question.service";
import {InputsTypesService} from "../../services/inputs-types.service";
import Swal from 'sweetalert2';
import {LoaderService} from "../../services/loader.service";
import {IInputsTypes} from "../../interfaces/InputsTypes/IInputsTypes";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {QuestionType} from "../../interfaces/question/QuestionType";

@Component({
  selector: 'app-question',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NewQuestionComponent,
    NgForOf,
    NgClass,
    DatePipe,
    NgIf,
  ],
  standalone: true,
  templateUrl: './question.component.html',
  styleUrl: './question.component.css'
})
export class QuestionComponent implements OnInit {
  inputs: IInputsTypes[] = [];
  questions: QuestionType[] = [];
  filteredQuestions: QuestionType[] = [];
  searchField: string = '';
  @ViewChild('createModal') createModal!: NewQuestionComponent;

  constructor(private service: QuestionService, private inputService: InputsTypesService, private loader: LoaderService) {}

  ngOnInit(): void {
    this.loader.show();
    this.inputService.getAll().subscribe({
      next: data => {
        this.inputs = data;
      },
      error: error => {
        Swal.fire({
          icon: 'error',
          position: 'top-right',
          showCancelButton: false,
          timer: 800,
          text: `Xəta baş verdi ${error}`
        })
      },
      complete: () => {
        this.loader.hide();
      }
    })
    this.service.getAll().subscribe({
      next: data => {
        this.filteredQuestions = this.questions = data;
      }
    })
  }

  openCreateModal() {
    this.createModal.open().then(dto => {
      if (dto) {
        this.loader.show();
        this.service.create(dto).subscribe({
          next: data => {
            if (data){
              this.service.getAll().subscribe({
                next: (response) => {
                  this.filteredQuestions = this.questions = response;
                }
              })
            }
          },
          error: error => {
            Swal.fire({
              icon: 'error',
              position: 'top-right',
              showCancelButton: false,
              timer: 800,
              text: `Xəta baş verdi ${error}`
            })
          },
          complete: () => {
            this.loader.hide();
          }
        })
      }
    });
  }

  toggleStatus(id: string, isActive: boolean){
    this.loader.show();

    const request$ = isActive
      ? this.service.disable(id)
      : this.service.enable(id);

    request$.subscribe({
      next: () => {
        this.service.getAll().subscribe({
          next: (response) => {
            this.filteredQuestions = this.questions = response;
            Swal.fire({
              icon: "success",
              title: `${isActive ? 'Deaktiv edildi!' : 'Aktiv edildi!'}`,
              showConfirmButton: false,
              timer: 700
            });
          }, error: (err)=> {
            console.error(err)
          }})
        this.loader.hide();
      },
      error: () => {
        this.loader.hide();
      }
    });
  }

  delete(id: string){
    Swal.fire({
      icon: "question",
      iconColor: '#ef4444',
      confirmButtonText: 'Bəli',
      cancelButtonText: 'Xeyr',
      title: 'Əməliyyatı təsdiq edin',
      text: `'${this.questions.find(x => x.id === id)?.label}' sualın silinməsinə əminsiniz?`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: '#d6303e',
      cancelButtonColor: '#19f311',
      background: 'rgba(59,130,246,0.12)',
      color: 'white'
    }).then(confirm => {
      if (confirm.isConfirmed) {
        this.loader.show();
        this.service.delete(id).subscribe({
          next: response => {
            Swal.fire({
              title: 'Silindi',
              icon: 'success'
            })
          },
          error: err => {
            Swal.fire({
              text: err,
              icon: 'error'
            })
          }, complete: () => {
            this.service.getAll().subscribe(response => {
              this.filteredQuestions = this.questions = response;
              this.loader.hide();
            })
          }
        })
      }
    })
  }

  search(){
    const search = (this.searchField || '').toLowerCase().trim();

    this.filteredQuestions = search
      ? this.questions.filter(x => (x.label || '').toLowerCase().includes(search))
      : this.questions;
  }
}
