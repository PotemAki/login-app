export class User {
  constructor (
    public displayName: string,
    public email: string,
    public id: string,
    private _token: string, 
    private _tokenExpirationDate: Date,
    public profileUrl?: string) {

    }
  
  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token
  }
}

export class UserPhoto {
  constructor (
    public profileUrl: string) { }
  
}