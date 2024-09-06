import {Component} from '@angular/core';
import {IBranch} from "../../interfaces/IBranch";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import { BranchService} from "../../services/branch.service";

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DatePipe
  ],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent {
  branches: IBranch[] = [];

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.branchService.getBranches().subscribe({
        next: (data: IBranch[]) => {
          this.branches = data
        },
        error: error => {
          console.log(error);
        }
      }
    )
  }

  changeBranchStatus(branch: IBranch) {
    this.branchService.changeBranchStatus(branch.name, branch.location, branch.address).subscribe({
    next: () => {
      const updateBranch = this.branches.find(b => b.name === branch.name && b.location === branch.location);
      if (updateBranch) {
        updateBranch.isActive = !updateBranch.isActive;
      }
    },
      error: (err) => {
        console.log(err);
      }
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
