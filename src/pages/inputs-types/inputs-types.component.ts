import {Component, OnInit, ViewChild} from '@angular/core';
import {InputsTypesService} from "../../services/inputs-types.service";
import {IInputsTypes} from "../../interfaces/InputsTypes/IInputsTypes";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {LoaderService} from "../../services/loader.service";
import Swal from "sweetalert2";
import {firstValueFrom} from "rxjs";
import {NewInputComponent} from "../../components/new-input/new-input.component";
import {InputCreateResult} from "../../types/InputCreateResult";
import {FormsModule} from "@angular/forms";

type InputType = {
  id: string;
  type: string;
  createdDate: string;
  createdBy: string;
  isActive: boolean;
  label: string;
}
@Component({
  selector: 'app-inputs-types',
  imports: [
    NgForOf,
    DatePipe,
    NgIf,
    NgClass,
    NewInputComponent,
    FormsModule
  ],
  standalone: true,
  templateUrl: './inputs-types.component.html',
  styleUrl: './inputs-types.component.css'
})
export class InputsTypesComponent implements OnInit{
  inputs: IInputsTypes[] = [];
  readonly inputTypes: {name: string, type: string}[] = [
    { name: 'tarix', type: 'date' },
    { name: 'email', type: 'email' },
    { name: 'şəkil', type: 'image' },
    { name: 'rəqəm', type: 'number' },
    { name: 'telefon', type: 'tel' },
    { name: 'mətn', type: 'text' },
    { name: 'seçim (hə/yox)', type: 'checkbox'},
    { name: 'siyahı', type: 'select' }
  ];
  isOpen: boolean = false;
  inputNewValue: string = '';
  selectedInput: InputType = {
    id: '',
    type: '',
    createdBy: '',
    createdDate: '',
    isActive: false,
    label: ''
  };
  @ViewChild('createModal') createModal!: NewInputComponent;

  constructor(private service: InputsTypesService, private loader: LoaderService) {}

  async openCreateModal() {
    const res = await this.createModal.open(); // { name, type } | undefined
    if (!res) return;

    this.loader.show();
    try {
      const response = await firstValueFrom(this.service.create(this.buildCreateBody(res)));
      this.inputs = await firstValueFrom(this.service.getAll());
    } finally {
      this.loader.hide();
    }
  }

  ngOnInit(): void {
    this.loader.show();
    this.service.getAll().subscribe(response => {
        this.inputs = response;
      this.loader.hide();
    })
  }

  async delete(id: string){
    const input = this.inputs.find(e => e.id === id);
    this.showConfirm({text: `${input?.label} adlı inputun silinməsinə əminsiniz`, title: 'Silinməsinə əminsiniz?', icon: 'question'}).then((confirm) => {
      if (confirm.isConfirmed){
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
              this.inputs = response;
              this.loader.hide();
            })
          }
        })
      }
    })
  }


  showConfirm({text, title, icon, confirmButtonText = 'Bəli', cancelButtonText = 'Xeyr'}: {
    text: string,
    title: string,
    icon?: "error" | "warning" | "info" | "success" | "question",
    confirmButtonText?: string,
    cancelButtonText?: string
  }) {
    return Swal.fire({
      text: text,
      title: title,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText
    })
  }

  toggleStatus(id: string, isActive: boolean) {
    this.loader.show();

    const request$ = isActive
      ? this.service.disable(id)
      : this.service.enable(id);

    request$.subscribe({
      next: () => {
        this.service.getAll().subscribe({
          next: (response) => {
            this.inputs = response;
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

  closeModal() {
    this.isOpen = false;
  }

  private buildCreateBody(model: InputCreateResult): {}{
    return {
      type: model.type,
      createdBy: this.getValueByKey('samAccountName'),
      label: model.name
    }
  }

  getValueByKey(key: string) {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData[key];
    }
  }

  proceedEdit(inputName: InputType){
    console.error(inputName)
    const body = {};
  }
}
