import { Component } from '@angular/core';
import {RolesService} from "../../services/admin-panel/roles.service";

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {
  constructor(private roleService: RolesService) {
    this.roleService.getAllRoles().subscribe(response => {
      console.log(response);
    })
  }
}
