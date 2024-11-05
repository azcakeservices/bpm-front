import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {BranchService} from "../../services/branch.service";
import {LoaderService} from "../../services/loader.service";
import {IBranchResponse} from "../../interfaces/IBranchResponse";
import {ToasterCustomService} from "../../services/toaster.service";

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DatePipe,
    NgClass
  ],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit{
  branchesResponse: IBranchResponse | null = null;
  branches: [{
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
    status: boolean
  }][] = [];

  constructor(
    private branchService: BranchService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loaderService.show()
    this.toastrService.info('Mağazalar yüklənir')
    this.branchService.getBranches().subscribe({
        next: (data: IBranchResponse) => {
          this.toastrService.success('Mağazalar yükləndi')
          this.branchesResponse = data;
          this.loaderService.hide()
          this.branches = this.branchResponseToBranch()
        },
        error: () => {
          this.toastrService.error('Mağazalar yüklənən zaman xəta baş verdi!')
          this.loaderService.hide()
        }
    })

  }

  branchResponseToBranch(){
    return this.branchesResponse!.data.map((branch) => {
      return branch.branches;
    })
  }
}
