import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {DetailedSalesService} from "../../services/detailed-sales.service";
import {LoaderService} from "../../services/loader.service";
import {ToasterCustomService} from "../../services/toaster.service";
import {BranchService} from "../../services/branch.service";
import {IBranchResponse} from "../../interfaces/IBranchResponse";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {ISaleResponse} from "../../interfaces/ISaleResponse";

@Component({
  selector: 'app-detailed-sales',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgMultiSelectDropDownModule,
    NgForOf
  ],
  templateUrl: './detailed-sales.component.html',
  styleUrl: './detailed-sales.component.css'
})
export class DetailedSalesComponent implements OnInit {
  selectedBranch: string = '';
  selectedBranchCode: string = '';
  dropDownSettings: {} = {};
  date: string = '';
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
  sales: ISaleResponse | null = null;
  errorMessage: string = '';
  filter = {
    branchName: '',
    productName: '',
    statementDate: '',
    barcode: ''
  }

  constructor(
    private detailedSalesService: DetailedSalesService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService,
    private branchService: BranchService,
  ) {
    this.dropDownSettings = {
      singleSelection: true,
      itemsShowLimit: 200,
      allowSearchFilter: true,
      maxHeight: 300,
      unSelectAllText: 'Sıfırla',
      searchPlaceholderText: 'Filial adı üzrə axtar'
    }
  }

  ngOnInit(): void {
    this.loadBranches()
  }

  private loadBranches(): void {
    this.loaderService.show()
    this.toastrService.info('Mağazalar yüklənir')
    this.branchService.getBranches().subscribe({
      next: (data: IBranchResponse) => {
        this.toastrService.success('Mağazalar yükləndi')
        this.branchesResponse = data;
        this.loaderService.hide()
        this.branches = this.branchResponseToBranch()
      },
      error: error => {
        this.toastrService.error('Mağazalar yüklənən zaman xəta baş verdi!')
        this.loaderService.hide()
      }
    })
  }

  branchResponseToBranch(){
    return this.branchesResponse!.data.map((branch) => {
      return branch.branches
    })
  }

  dropDownBranches():string[]{
    return this.branches[0].map((branch) => {
      return branch.branchName
    })
  }

  onSubmit(){
    if (!this.date){
      this.toastrService.error('Tarix mütləq seçilməlidir!')
      return;
    }
    if(this.selectedBranch){
      this.getBranchCodeByDate(this.selectedBranchCode);
    }
    this.loaderService.show();
    this.toastrService.info('Detallı satışlar yüklənir, bir qədər gözləyin');
    this.detailedSalesService.getDetailedSale(this.date, this.selectedBranch).subscribe(response => {
      this.sales = response;
      console.log(this.sales)
      this.loaderService.hide()
    }, error => {
      this.toastrService.error(error)
    })

  }

  private getBranchCodeByDate(branchName: string){
    const branch = this.branches.find(b => (b as any)?.branchName === branchName);
  }

  downloadExcel(){
    this.loaderService.show();
    this.detailedSalesService.downloadExcel(this.sales!).subscribe(response => {
      const base64 = response.body.base64;
      const fileName = response.body.fileName;
      this.downloadFile(base64, fileName);
      this.toastrService.success(`Fayl Yüklənmələr qovluğuna əlavə edildi: ${fileName}`)
      this.loaderService.hide()
    }, error => {
      this.toastrService.error('Xəta baş verdi, bir daha cəhd edin')
      this.loaderService.hide()
    })
  }

  private downloadFile(base64: string, fileName: string){
    const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
}
