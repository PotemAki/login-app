import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { SettingsService } from './settings.service';
import { NgForm } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  userPhotoSub: Subscription;
  userName = '';
  userEmail = '';
  idToken = ''
  currPassword = 'Enter your current password'
  error = '';
  isLoading = false
  isChangingPassword = false;
  imagePreview = 'assets/blank.png'
  currentFile: File

  constructor(private authService: AuthService, private settService: SettingsService, private fireStorage: AngularFireStorage) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.userName = user.displayName
        this.userEmail = user.email
        this.idToken = user.token
        // this.imagePreview = user.profileUrl
      } else {
        this.userName = '';
        this.userEmail = '';
        // this.imagePreview = 'assets/blank.png';
      }
    })
    this.userPhotoSub = this.authService.userPhoto.subscribe(userPhoto => {
      if (userPhoto) {
        this.imagePreview = userPhoto.profileUrl
      } else {
        this.imagePreview = 'assets/blank.png'
      }
    })
  }

 onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.currentFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  resetProfilePic() {
    this.imagePreview = 'assets/blank.png';

    fetch('assets/blank.png')
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], 'default-profile-pic.png', { type: 'image/png' });
        this.currentFile = file;
      });
  }

  async uploadPorfilePic() {
    if (this.currentFile) {
      const path = `pic/${this.currentFile.name}`
      const uploadTask = await this.fireStorage.upload(path, this.currentFile)
      const url = await uploadTask.ref.getDownloadURL()
      this.isLoading = true;
      this.settService.updatePicture(url, this.idToken).subscribe(
        resData => {
          this.authService.updatePicture(resData.photoUrl)
          this.isLoading = false;
        }, errorMessage => {
          this.isLoading = false;
          this.error = errorMessage
        }
      )
    }
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
    this.userPhotoSub.unsubscribe
  }
}
