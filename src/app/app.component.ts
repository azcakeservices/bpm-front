import {Component, OnInit} from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import {HeaderComponent} from "../header/header.component";
import {FooterComponent} from "../footer/footer.component";
import {NgIf} from "@angular/common";
import {LoaderComponent} from "../components/loader/loader.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NgIf,
    RouterModule,
    LoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  private readonly predefinedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbWFkbWluIiwianRpIjoiYmYzNDQ3YWItZjJhZC00NzJlLTk2YmYtYTYxNTA2MmE5NTU4IiwiZGlzcGxheU5hbWUiOiJFbG51ciBBZG1pbmlzdHJhdGl2ZSBBY2NvdW50IiwiZW1haWwiOiJlbG51ckBhemNha2UuYXoiLCJkZXBhcnRtZW50IjoiSVQiLCJyb2xlcyI6IkNOPUxvY2sgV2luZG93cyBVcGRhdGUsT1U9R3JvdXBzLERDPWF6Y2FrZSxEQz1heixDTj1JVCBVc2VycyxPVT1Hcm91cHMsT1U9SW5mb3JtYXNpeWEgVGV4bm9sb2dpeWFsYXJpIElkYXJlc2ksT1U9QXpDYWtlIEhlYWQgT2ZmaWNlLERDPWF6Y2FrZSxEQz1heixDTj1FbnRlcnByaXNlIEFkbWlucyxDTj1Vc2VycyxEQz1hemNha2UsREM9YXosQ049U2NoZW1hIEFkbWlucyxDTj1Vc2VycyxEQz1hemNha2UsREM9YXosQ049QWRtaW5pc3RyYXRvcnMsQ049QnVpbHRpbixEQz1hemNha2UsREM9YXoiLCJleHAiOjE3MzU3NDkxODMsImlzcyI6ImF6Y2FrZXNlcnZpY2VzIiwiYXVkIjoiQXpDYWtlQXBpR2F0ZXdheSJ9.pCmqFk4gAS9B9Q4krp3cxXRMGQtfGg8K3eFXx940z6Y';

  ngOnInit() {
    localStorage.setItem('authToken', this.predefinedToken)
  }

  constructor(private router: Router) {}

  shouldShowHeader (): boolean {
    return this.router.url !== '/login'
  }


}
