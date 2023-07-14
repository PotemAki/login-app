import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub!: Subscription;
  userLogin: string = ''

  constructor(private authService: AuthService, private router: Router) { }



  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !user ? false : true
      if (user) {
        this.userLogin = user.displayName
      } else {
        this.userLogin = '';
      }
    })
  }
  onLogout() {
    this.authService.logout()
    this.userSub.unsubscribe;
  }
  onSettings() {
    this.router.navigate(['/settings'])
  }
  
  ngOnDestroy() {
    this.userSub.unsubscribe;
  }

}
