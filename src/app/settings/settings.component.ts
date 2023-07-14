import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { SettingsService } from './settings.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  userName = '';
  userEmail = '';
  idToken = ''
  currPassword = 'Enter your current password'
  error = '';
  isLoading = false
  isChangingPassword = false;

  constructor(private authService: AuthService, private settService: SettingsService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.userName = user.displayName
        this.userEmail = user.email
        this.idToken = user.token
      } else {
        this.userName = '';
        this.userEmail = '';
      }
    })
  }
  updateName() {
    this.isLoading = true;
    this.settService.updateProfile(this.userName, this.idToken).subscribe(
      resData => {
        this.authService.updateProfile(resData.displayName)
        this.isLoading = false;
        // this.idToken = resData.idToken
      }, errorMessage => {
        this.isLoading = false;
        this.error = errorMessage
      }
    )
  }
  changePassword(form: NgForm) {
    this.error = ''
    this.isLoading = true;
    this.authService.authPassword(this.userEmail, form.value.currPassword).subscribe(
      resData => {
        this.isLoading = false;
        this.isChangingPassword = true
        this.idToken = resData.idToken
      }, errorMessage => {
        this.isLoading = false;
        this.error = errorMessage
      }
  )
  form.reset()
  }
  passwordsMatch(newPass, repeatNewPass): boolean {
    return newPass === repeatNewPass;
  }
  updatePassword(form: NgForm) {
    this.error = ''
    if (!form.valid) {
      return;
    }
    const password = form.value.newPassword;
    this.isLoading = true;
    this.settService.updatePassword(password, this.idToken).subscribe(
      resData => {
        this.isLoading = false;
        this.isChangingPassword = false;
      }, errorMessage => {
        this.isLoading = false;
        this.error = errorMessage
      }
  )
    form.reset()
  }
  cancelChangePassword() {
    this.isChangingPassword = false;
  }

  ngOnDestroy() {
    this.userSub.unsubscribe
  }
}
