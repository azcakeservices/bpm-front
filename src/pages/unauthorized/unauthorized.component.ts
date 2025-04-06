import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {RolesService} from "../../services/admin-panel/roles.service";

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {}
