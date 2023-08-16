import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment.development";

interface UpdateResponseData{
  localId: string;
  email: string;
  passwordHash: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  displayName: string;
  photoUrl: string
}

@Injectable({providedIn: 'root'})
export class SettingsService { 

constructor(private http: HttpClient) { }

updateProfile(userName: string, idToken: string) {
  return this.http.post<UpdateResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:update?key=' + environment.fireBaseAPIKey, {
    idToken: idToken,
    displayName: userName,
    returnSecureToken: true
  }).pipe(catchError(this.handleError))
}
updatePicture(userPhoto: string, idToken: string) {
  return this.http.post<UpdateResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:update?key=' + environment.fireBaseAPIKey, {
    idToken: idToken,
    photoUrl: userPhoto,
    returnSecureToken: true
  }).pipe(catchError(this.handleError))
}

updatePassword(password: string, idToken: string) {
  return this.http.post<UpdateResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:update?key=' + environment.fireBaseAPIKey, {
    idToken: idToken,
    password: password,
    returnSecureToken: true
  }).pipe(catchError(this.handleError))
}

private handleError(errorRes: HttpErrorResponse) {
  let errorMessage = 'Something went wrong! Please log in again.'
  if (!errorRes.error || !errorRes.error.error) {
    return throwError(errorMessage)
  }
  switch (errorRes.error.error.message) {
    case 'INVALID_ID_TOKEN':
      errorMessage = 'Your redentials are no longer valid. Please sign in again';
      break;
    case 'TOKEN_EXPIRED': 
      errorMessage = 'Your redentials are no longer valid. Please sign in again';
      break;
    
  }
  return throwError(errorMessage);
}
}