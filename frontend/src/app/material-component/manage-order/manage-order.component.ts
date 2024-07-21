import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
// import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})
export class ManageOrderComponent implements OnInit {
  displayedColumns: string[] = ['name', 'category', 'price', 'quantity', 'total', 'edit'];
  dataSource:any = [];
  responseMessage: any;
  manageOrderForm: any = FormGroup;
  categorys: any = [];
  products: any = [];
  price: any;
  totalAmount: number = 0;

  constructor(private formBuilder: FormBuilder,private router:Router, private categoryService: CategoryService, private productService: ProductService, private snackbarService: SnackbarService, private billService: BillService,private ngxService:NgxUiLoaderService ) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.getCategorys();
    this.manageOrderForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      contactNumber: [null, [Validators.required, Validators.pattern(GlobalConstants.contactNumberRegex)]],
      paymentMethod: [null, [Validators.required]],
      product: [null, [Validators.required]],
      category: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      price: [null, [Validators.required]],
      total: [0, [Validators.required]],
    })
  }

  getCategorys(){
    this.categoryService.getCategory().subscribe((res:any)=>{
      this.ngxService.stop();
      this.categorys = res;
    },(err:any)=>{
      this.ngxService.stop();
      if(err.error?.message){
        this.responseMessage = err.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    })
  }

  getProductByCategory(value:any){
    this.productService.getProductsByCategory(value.id).subscribe((res:any)=>{
      this.products = res;
      this.manageOrderForm.controls['price'].setValue('');
      this.manageOrderForm.controls['quantity'].setValue('');
      this.manageOrderForm.controls['total'].setValue(0);
    },(err:any)=>{
      if(err.error?.message){
        this.responseMessage = err.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    })
  }

  getProductDetails(value:any){
    this.productService.getProductsById(value.product_id).subscribe((res:any)=>{
      this.price = res.price;
      this.manageOrderForm.controls['price'].setValue(res.price);
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.price*1);
    },(err:any)=>{
      if(err.error?.message){
        this.responseMessage = err.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    })
  }



  setQuantity(value:any){
    var temp = this.manageOrderForm.controls['quantity'].value;
    if(temp > 0){
      this.manageOrderForm.controls['total'].setValue(this.manageOrderForm.controls['quantity'].value * this.manageOrderForm.controls['price'].value);
    }
    else if(temp !=''){
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.manageOrderForm.controls['quantity'].value * this.manageOrderForm.controls['price'].value);
    }
  }

  validateProductAdd(){
    if(this.manageOrderForm.controls['total'].value === 0 || this.manageOrderForm.controls['total'].value === null || this.manageOrderForm.controls['quantity'].value <= 0){
      return true;
    }
    else{
      return false;
    }
  }

  validateSubmit(){
    if(this.totalAmount === 0 || this.manageOrderForm.controls['name'].value === null || this.manageOrderForm.controls['email'].value === null || this.manageOrderForm.controls['contactNumber'].value === null || this.manageOrderForm.controls['paymentMethod'].value === null || !(this.manageOrderForm.controls['contactNumber'].valid) || !(this.manageOrderForm.controls['email'].valid) ){
      return true;
    }
    else{
      return false;
    }
  }

  add(){
    var formData = this.manageOrderForm.value;
    var productName = this.dataSource.find((e: {id:number;})=> e.id == formData.product.id);
    console.log(formData);
    this.totalAmount = this.totalAmount + formData.total;
    this.dataSource.push({
      id:formData.product.id,
      name:formData.product.name,
      category:formData.category.name,
      quantity:formData.quantity,
      price:formData.price,
      total:formData.total
    });
    this.dataSource = [...this.dataSource];
    this.snackbarService.openSnackBar(GlobalConstants.productAdded,"success");
  }

  handleDelteAction(value:any,element:any){
    this.totalAmount = this.totalAmount - element.total;
    this.dataSource.splice(value,1);
    this.dataSource = [...this.dataSource];
  }

  submitAction(){
    this.ngxService.start();
    var formData = this.manageOrderForm.value;
    var data = {
      name:formData.name,
      email:formData.email,
      contactNumber:formData.contactNumber,
      paymentMethod:formData.paymentMethod,
      total: this.totalAmount,
      createdBy: 'admin',
      productDetails: JSON.stringify(this.dataSource)
    }
    this.billService.generateBill(data).subscribe((res:any)=>{
      this.downloadFile(res?.uuid);
      this.manageOrderForm.reset();
      this.dataSource = [];
      this.totalAmount = 0;
    },(err:any)=>{
      if(err.error?.message){
        this.responseMessage = err.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    })
  }

  downloadFile(fileName:any){
    var data = {
      uuid:fileName
    }

    this.billService.getBill(data).subscribe((res:any)=>{
      saveAs(res,fileName+'.pdf');
      this.ngxService.stop();
    })
  }
}
