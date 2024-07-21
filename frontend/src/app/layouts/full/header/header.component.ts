import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChangePasswordComponent } from 'src/app/material-component/dialog/change-password/change-password.component';
import { ConfirmationComponent } from 'src/app/material-component/dialog/confirmation/confirmation.component';
import { UserService } from 'src/app/services/user.service';
import jwt_decode from "jwt-decode";
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent {
  role: any;
  name: any;
  responseMessage: any;


  constructor(private router: Router,
    private dialog: MatDialog,
    private userService:UserService,
    private snackbar:SnackbarService) {
      this.userService.getUserName().subscribe((res: any) => {
        this.name = res;
      }, (err: any) => {
        if (err.error?.message) {
          this.responseMessage = err.error?.message;
        }
        else {
          this.responseMessage = GlobalConstants.genericError;
        }
        this.snackbar.openSnackBar(this.responseMessage, GlobalConstants.error);
      })
  }

  logout(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout'
    };
    const dialogRef = this.dialog.open(ConfirmationComponent,dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((user)=>{
      dialogRef.close();
      localStorage.clear();
      this.router.navigate(['/']);
    })
  }

  changePassword(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "550px";
    this.dialog.open(ChangePasswordComponent,dialogConfig);
  }


}
