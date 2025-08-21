import { Component } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-employee-form',
    imports: [NgFor, NgIf, FormsModule, NgSwitchCase, NgSwitchDefault, NgSwitch],
    standalone: true,
    templateUrl: './employee-form.component.html',
    styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent {

}
