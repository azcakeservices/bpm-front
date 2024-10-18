import {Component, OnInit} from '@angular/core';
import {IBranch} from "../../interfaces/IBranch";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import { BranchService} from "../../services/branch.service";
import {LoaderService} from "../../services/loader.service";

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
export class BranchesComponent implements OnInit{
  branches: IBranch[] = [];

  constructor(
    private branchService: BranchService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loaderService.show()
    this.branchService.getBranches().subscribe({
        next: (data: IBranch[]) => {
          this.branches = data;
          this.loaderService.hide()
        },
        error: error => {
          console.log(error);
          this.loaderService.hide()
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
