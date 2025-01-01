import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  currentDate: string = ''
  userName: string = ''
  department: string = ''
  constructor(private router: Router) {}
  signOut(){
    localStorage.removeItem('authToken');
    this.router.navigate(['/login'])

  }

  ngOnInit(){

    const user = localStorage.getItem('user');
    console.log(user)
    if (user) {
      const userData = JSON.parse(user);
      this.userName = userData['displayName'] ?? '';
      console.log('userData', userData)
      this.department = this.getValueByKey('department')
    }
    this.updateDateTime()
    setInterval(() => {
      this.updateDateTime()
    }, 1000)
  }

  getValueByKey(key: string){
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      console.log(userData[key])
      return userData[key]
    }
  }

  updateDateTime(){
    const now = new Date()
    this.currentDate = now.toLocaleString()
  }
}
