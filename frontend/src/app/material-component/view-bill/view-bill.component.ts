import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogClose, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';
import { ViewBillProductsComponent } from '../dialog/view-bill-products/view-bill-products.component';

@Component({
  selector: 'app-view-bill',
  templateUrl: './view-bill.component.html',
  styleUrls: ['./view-bill.component.scss']
})
export class ViewBillComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'contactNumber', 'paymentMethod', 'total', 'view'];
  dataSource:any = [];
  responseMessage: any;
  constructor(private router:Router, private dialog:MatDialog,
     private snackbar: SnackbarService, 
     private billService: BillService,
     private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.tableData();
  }

  tableData(){
    this.billService.getBills().subscribe((res:any)=>{
      this.dataSource = new MatTableDataSource(res);
    },(err:any)=>{
      if(err.error?.message){
        this.responseMessage = err.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbar.openSnackBar(this.responseMessage,GlobalConstants.error);
    })
  }

  applyFilter(event:Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  handleViewAction(value:any){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      data:value
    };

    dialogConfig.width = "100%";
    const dialogRef = this.dialog.open(ViewBillProductsComponent,dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    })
  }

  handleDeleteAction(value:any){
      const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          message:'delete ' + value.name + ' bill ?'
        }
        dialogConfig.width="500px";
        const dialogRef = this.dialog.open(ConfirmationComponent,dialogConfig);
        const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res)=>{
          this.deletebill(value.id);
          dialogRef.close();
        })
      }
    
    deletebill(id:any){
      this.billService.delete(id).subscribe((res:any)=>{
        this.tableData();
        this.responseMessage = res.message;
        this.snackbar.openSnackBar(this.responseMessage,"success");
      },(err:any)=>{
        if(err.error?.message){
          this.responseMessage = err.error?.message;
        }
        else if(err.status == 401){
          this.responseMessage = GlobalConstants.unauthorized;
        }
        else{
          this.responseMessage = GlobalConstants.genericError;
        }
        this.snackbar.openSnackBar(this.responseMessage,GlobalConstants.error);
      })
    }
    

  downloadReport(value:any){
    this.ngxService.start();
    console.log(value.uuid);
    var data = {
      uuid:value.uuid
    }

    this.billService.getBill(data).subscribe((res:any)=>{
      saveAs(res,'bill.pdf');
      this.ngxService.stop();
    })
  }
}

