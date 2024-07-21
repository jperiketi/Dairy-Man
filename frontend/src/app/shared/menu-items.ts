import { Injectable } from "@angular/core"

export interface Menu{
    state:string,
    name:string,
    icon:string,
    role:string,
}

const MENUITEMS = [
    {state:'dashboard',name:'Dashboard',icon:'dashboard',role:''},
    {state:'category',name:'Manage Category',icon:'category',role:'admin'},
    {state:'product',name:'Manage Product',icon:'inventory',role:'admin'},
    {state:'order',name:'New Order',icon:'shopping_cart',role:''},
    {state:'bill',name:'View Bill',icon:'request_quote',role:''},
    {state:'user',name:'Manage Users',icon:'manage_accounts',role:'admin'}
];

@Injectable()
export class MenuItems{
    getMenuitem(): Menu[]{
        return MENUITEMS;
    }
}