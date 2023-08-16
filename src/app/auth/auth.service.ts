import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { BehaviorSubject, throwError } from "rxjs";
import { User, UserPhoto } from "./user.model";
import { catchError, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment.development";

interface AuthResponseData{
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean
  displayName: string;
  profileUrl: string;
  users: object;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  userPhoto = new BehaviorSubject<UserPhoto>(null);
  private tokenExpirationTimer: any;
  currentUrl;
  defaultUrl = 'https://firebasestorage.googleapis.com/v0/b/login-app-fefb2.appspot.com/o/pic%2Fdefault-profile-pic.png?alt=media&token=20ed6cab-d3d4-40eb-b541-fb2ba6d8834d'
  

  constructor (private http: HttpClient, private router: Router) { }

  autoLogin() {
    this.autoLoginPhoto()
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      return
    }
    const userData: {
      displayName: string;
      email: string;
      id: string;
      _token:string; 
      _tokenExpirationDate: Date;
    } = JSON.parse(userDataString);
    if (!userData) {
      return
    }
    const loadedUser = new User(
      userData.displayName,
      userData.email,
      userData.id,
      userData._token,
      new Date (userData._tokenExpirationDate),
    )
    if (loadedUser.token) {
      this.user.next(loadedUser)
      //recalc for auto log out
      const expirationDuration = 
        new Date(userData._tokenExpirationDate).getTime() - new Date().getTime()
      this.autoLogout(expirationDuration)
    }
  }
  updateProfile(displayName: string) {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      return
    }
    const userData: {
      displayName: string;
      email: string;
      id: string;
      _token: string; 
      _tokenExpirationDate: Date;
    } = JSON.parse(userDataString);
    if (!userData) {
      return
    }
    const loadedUser = new User(
      displayName,
      userData.email,
      userData.id,
      userData._token,
      new Date (userData._tokenExpirationDate),
    )
    if (loadedUser.token) {
      this.user.next(loadedUser)
      //recalc for auto log out
      const expirationDuration = 
        new Date(userData._tokenExpirationDate).getTime() - new Date().getTime()
      this.autoLogout(expirationDuration)
    }
    localStorage.setItem('userData', JSON.stringify(loadedUser))
  }
  updatePicture(profileUrl: string) {
    const userDataStringPhoto = localStorage.getItem('userDataPhoto')
    if (!userDataStringPhoto) {
      return
    }
    const userPhoto = new UserPhoto(profileUrl)
    this.userPhoto.next(userPhoto)
    localStorage.setItem('userDataPhoto', JSON.stringify(userPhoto))
  }
  getUserPic(idToken: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + environment.fireBaseAPIKey, {
    idToken: idToken
  }).pipe(catchError(this.handleError)).subscribe( resData => {
    const photoUrl = resData.users[0].photoUrl;
    if (!photoUrl) {
      const userPhoto = new UserPhoto(this.defaultUrl)
      this.userPhoto.next(userPhoto)
      localStorage.setItem('userDataPhoto', JSON.stringify(userPhoto))
    } else {
      const userPhoto = new UserPhoto(photoUrl)
      this.userPhoto.next(userPhoto)
      localStorage.setItem('userDataPhoto', JSON.stringify(userPhoto))
    }
  })
  }
  autoLoginPhoto() {
    const userDataPhotoString = localStorage.getItem('userDataPhoto');
    if (!userDataPhotoString) {
      return
    }
    const userDataPhoto: {
      profileUrl: string
    } = JSON.parse(userDataPhotoString);
    if (!userDataPhoto) {
      return
    }
    const loadedUserPhoto = new UserPhoto(
      userDataPhoto.profileUrl
    )
    this.userPhoto.next(loadedUserPhoto)
  }

  signup(name: string, email: string, password: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.fireBaseAPIKey, {
      displayName: name,
      email: email,
      password: password,
      returnSecureToken: true,
    }).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuth(
        resData.displayName,
        resData.email,
        resData.localId,
        resData.idToken,
        +resData.expiresIn
      )
    }))
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.fireBaseAPIKey, {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap(resData =>{
      this.handleAuth(
        resData.displayName,
        resData.email,
        resData.localId,
        resData.idToken,
        +resData.expiresIn
      )
    }))
  }
  logout() {
    this.user.next(null)
    this.router.navigate(['/auth'])
    localStorage.removeItem('userData')
    localStorage.removeItem('userDataPhoto')
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }
  //logout after 1h
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration)
  }
  authPassword(email, password) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.fireBaseAPIKey, {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError))
  }
  
  resetPassword(email: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' + environment.fireBaseAPIKey, {
      email: email,
      requestType: 'PASSWORD_RESET'
    }).pipe(catchError(this.handleError))
  }

  private handleAuth(displayName: string, email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000)
    const user = new User(displayName, email, userId, token, expirationDate)
    this.user.next(user)
    this.autoLogout(expiresIn * 1000)
    localStorage.setItem('userData', JSON.stringify(user))
  }
  
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'Something went wrong!'
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage)
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'There is user with this email alredy!';
        break;
      case 'EMAIL_NOT_FOUND': 
        errorMessage = 'This email does not exist';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Password is incorrect!';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER : Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.':
        errorMessage = 'Too many attempts, try again later!'
        break;
      case 'MISSING_PASSWORD':
        errorMessage = 'Please provide a valid password!'
        break;
    }
    return throwError(errorMessage);
  }
}