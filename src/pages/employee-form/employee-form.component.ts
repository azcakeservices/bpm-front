import { Component, OnInit } from '@angular/core';
import {LoaderService} from "../../services/loader.service";
import {ToasterCustomService} from "../../services/toaster.service";
import {EmployeeFormService} from "../../services/employee-form.service";

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit {

  constructor(
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService,
    private employeeService: EmployeeFormService
  ) {}

  ngOnInit(): void {
        this.employeeService.getEmployeeForms();
        // console.log(forms)
    }

}
