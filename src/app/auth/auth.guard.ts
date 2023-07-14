import { Injectable, inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs-compat";
import { map, take } from "rxjs/operators";

@Injectable({providedIn: 'root'})
class PremissionService {
  constructor(private router: Router, private authService: AuthService) {

  }
  
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
    return this.authService.user.pipe(take(1),map(user => {
      const isAuth = !!user;
      if (isAuth) {
        return true
      }
      return this.router.createUrlTree(['/auth'])
    }))
  }
  canLogPanelAppear(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
    return this.authService.user.pipe(take(1),map(user => {
      const isAuth = !!user;
      if (!isAuth) {
        return true
      }
      return this.router.createUrlTree(['/main'])
    }))
  }
 
}
export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> => {
  return inject(PremissionService).canActivate(next, state)
  
}
export const LogPanelGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> => {
  return inject(PremissionService).canLogPanelAppear(next, state)
  
}