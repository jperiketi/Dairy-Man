import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';
import jwt_decode from 'jwt-decode';
import { GlobalConstants } from '../shared/global-constants';
import { CloseScrollStrategy } from '@angular/cdk/overlay';
@Injectable({
  providedIn: 'root'
})
export class RouteGuardService {

  constructor(public auth:AuthService,
    public router:Router,
    private snackbarService:SnackbarService) { }

    canActivate(route:ActivatedRouteSnapshot):boolean{
      let expectedRoleArray = route.data;
      expectedRoleArray = expectedRoleArray.expectedRole;

      const token:any = localStorage.getItem('token');
      var tokenPayLoad:any;
      try{
        tokenPayLoad = jwt_decode(token);
      }
      catch(err){
        console.log(err);
        console.log("error in jwt decode");
        localStorage.clear();
        this.router.navigate(['/']);
      }

      console.log('was here');
      let checkRole = false;
      for(let i =0;i<expectedRoleArray.length;i++){
        if(expectedRoleArray[i]==tokenPayLoad.role){
          checkRole = true;
          console.log(tokenPayLoad.role);
          console.log("correct role");
        }
      }

      if(tokenPayLoad.role == 'user'|| tokenPayLoad.role == 'admin'){
        if(this.auth.isAuthenticated() && checkRole){
          return true;
        }
        this.snackbarService.openSnackBar(GlobalConstants.unauthorized,GlobalConstants.error);
        this.router.navigate(['/dairy/dashboard']);
        return false;
      }
      else{
        console.log("invlaid role");
        this.router.navigate(['/']);
        localStorage.clear();
        return false;
      }
    }
  }
