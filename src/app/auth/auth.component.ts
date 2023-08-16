import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  registerPasswordValue: string = ''
  registerRepeatPasswordValue: string = ''
  isLogin = true;
  showPopup = false;
  isLoading = false;
  forgotPassword = true;
  error: string = ''
  errorEmail: string = '';
  
  constructor(private router: Router, private authService: AuthService) {

  }
  
  passwordsMatch(): boolean {
    return this.registerPasswordValue === this.registerRepeatPasswordValue;
  }

  tabLogin() {
    this.error = ''
    this.isLogin = true
  }
  tabRegister() {
    this.error = ''
    this.isLogin = false
  }
  openConditions() {
    this.showPopup = true;
  }
  closeConditions() {
    this.showPopup = false;
  }
  sendReset(form: NgForm) {
    this.authService.resetPassword(form.value.emailR).subscribe(
      resData => {
        this.forgotPassword = true
      }, errorMessage => {
        this.errorEmail = errorMessage
      }
  )
  form.reset()
  }
  onReset() {
    this.forgotPassword = !this.forgotPassword
  }
  onSubmitLogin(form: NgForm) {
    this.error = ''
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.isLoading = true;
    this.authService.login(email, password).subscribe(
      resData => {
        this.isLoading = false;
        this.authService.getUserPic(resData.idToken)
        this.router.navigate(['/main'])
      }, errorMessage => {
        this.error = errorMessage
        this.isLoading = false;
      }
  )
    form.reset()
    
  }
  onSubmitSignUp(form: NgForm) {
    this.error = ''
    if (!form.valid) {
      return;
    }
    const name = form.value.registerUsername
    const email = form.value.registerEmail;
    const password = form.value.registerPassword;
    this.isLoading = true;
    this.authService.signup(name, email, password).subscribe(
      resData => {
        this.isLoading = false;
        this.authService.getUserPic(resData.idToken)
        this.router.navigate(['/main'])
      },errorMessage => {
        this.error = errorMessage
        this.isLoading = false;
      }
    )
    form.reset()
  }
}
