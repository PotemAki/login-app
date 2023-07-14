import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { BehaviorSubject, throwError } from "rxjs";
import { User } from "./user.model";
import { catchError, tap } from "rxjs/operators";
import { Router } from "@angular/router";

interface AuthResponseData{
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean
  displayName: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor (private http: HttpClient, private router: Router) { }

  autoLogin() {
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
      new Date (userData._tokenExpirationDate)
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
      new Date (userData._tokenExpirationDate)
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

  signup(name: string, email: string, password: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBViC9h0rCzYyBJpvkHxvTjS3XwIiWVe1A', {
      displayName: name,
      email: email,
      password: password,
      returnSecureToken: true
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
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBViC9h0rCzYyBJpvkHxvTjS3XwIiWVe1A', {
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
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBViC9h0rCzYyBJpvkHxvTjS3XwIiWVe1A', {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError))
  }
  
  resetPassword(email: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyBViC9h0rCzYyBJpvkHxvTjS3XwIiWVe1A', {
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