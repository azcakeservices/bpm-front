import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { BranchService } from '../../services/branch.service';
import { LoaderService } from '../../services/loader.service';
import { IBranchResponse } from '../../interfaces/IBranchResponse';
import { ToasterCustomService } from '../../services/toaster.service';

interface Branch {
  companyCode: string;
  companyFullName: string;
  branchTypeCode: string;
  branchCode: string;
  branchName: string;
  codeNameType: string;
  taxesObjectCode: string;
  countryISO2: string;
  address: string;
  latitude: string;
  longitude: string;
  status: boolean;
}

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit {

  branchesResponse: IBranchResponse | null = null;

  branches: Branch[] = [];
  filteredBranches: Branch[] = [];

  searchTerm: string = '';

  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  isLoading: boolean = false;
  errorMessage: string = '';

  totalBranches: number = 0;
  activeBranches: number = 0;
  inactiveBranches: number = 0;

  constructor(
    private branchService: BranchService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.loaderService.show();

    this.toastrService.info('Mağazalar yüklənir');

    this.branchService.getBranches()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loaderService.hide();
        })
      )
      .subscribe({

        next: (data: IBranchResponse) => {

          this.branchesResponse = data;

          this.branches = this.branchResponseToBranch();

          this.calculateStatistics();

          this.applyFilters();

          this.toastrService.success(
            'Mağazalar yükləndi'
          );
        },

        error: () => {

          this.errorMessage =
            'Mağazalar yüklənən zaman xəta baş verdi!';

          this.toastrService.error(this.errorMessage);
        }

      });
  }

  branchResponseToBranch(): Branch[] {

    return this.branchesResponse?.data.flatMap(
      item => item.branches
    ) ?? [];

  }

  calculateStatistics(): void {

    this.totalBranches = this.branches.length;

    this.activeBranches = this.branches.filter(
      branch => branch.status
    ).length;

    this.inactiveBranches =
      this.totalBranches - this.activeBranches;

  }

  applyFilters(): void {

    const search = this.searchTerm
      .trim()
      .toLocaleLowerCase('az');

    this.filteredBranches = this.branches.filter(branch => {

      const matchesSearch = [
        branch.branchCode,
        branch.branchName,
        branch.address
      ].some(value =>
        (value ?? '')
          .toLocaleLowerCase('az')
          .includes(search)
      );

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && branch.status) ||
        (this.statusFilter === 'inactive' && !branch.status);

      return matchesSearch && matchesStatus;

    });
  }

  resetFilters(): void {

    this.searchTerm = '';
    this.statusFilter = 'all';

    this.applyFilters();

  }

  getBranchAddress(address: string | null | undefined): string {
    return address?.trim() || 'Qeyd olunmayıb';
  }
}
