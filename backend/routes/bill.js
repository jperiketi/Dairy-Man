//importing all the essential files and libraries
const express = require('express');
const database = require('../database');
const router = express.Router();

let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');

//importing auth and role files
var auth = require('../services/authentication');
var role = require('../services/checkRole');

//api for creating bill
router.post('/generateBill',auth.authenticateToken,(request,response)=>{
    const uuidBill = uuid.v1();
    const orderDetails = request.body;
    var productsDetailsReport = JSON.parse(orderDetails.productDetails);
    var queryi = "insert into bill (name,uuid,email,contactNumber,paymentMethod,total,productDetails) values (?,?,?,?,?,?,?)";
    database.query(queryi,[orderDetails.name,uuidBill,orderDetails.email,orderDetails.contactNumber,orderDetails.paymentMethod,orderDetails.total,orderDetails.productDetails],(error,results)=>{
        if(!error){
            ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productsDetails:productsDetailsReport,name:orderDetails.name,email:orderDetails.email,contactNumber:orderDetails.contactNumber,paymentMethod:orderDetails.paymentMethod,totalAmount:orderDetails.total},(error,results)=>{
                if(error){
                    return response.status(500).json(error);
                }
                else{
                    pdf.create(results).toFile('./bills/'+uuidBill+".pdf",function(error,data){
                        if(error){
                            console.log(error);
                            return response.status(500).json(error);
                        }
                        else{
                            return response.status(200).json({uuid: uuidBill});
                        }
                    })
                }
            })

        }
        else{
            return response.status(500).json(error);
        }
    })

})

router.post('/getBill',auth.authenticateToken,function(request,response){
    const orderDetails = request.body;
    const pdfPath = './bills/'+orderDetails.uuid+'.pdf';
    if(fs.existsSync(pdfPath)){
        response.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(response);
    }
    else{
        var productsDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productsDetails:productsDetailsReport,name:orderDetails.name,email:orderDetails.email,contactNumber:orderDetails.contactNumber,paymentMethod:orderDetails.paymentMethod,totalAmount:orderDetails.totalAmount},(error,results)=>{
        if(error){
            return response.status(500).json(error);
        }
        else{
            pdf.create(results).toFile('./bills/'+orderDetails.uuid+".pdf",function(error,data){
                if(error){
                    console.log(error);
                    return response.status(500).json(error);
                }
                else{
                    response.contentType("application/pdf");
                    fs.createReadStream(pdfPath).pipe(response);
                }
            })
        }
        })
    }
})

router.get('/getBills',auth.authenticateToken,(request,response,next)=>{
    var queryi = "select * from bill order by id DESC";
    database.query(queryi,(error,results)=>{
        if(!error){
            return response.status(200).json(results);
        }
        else{
            return response.status(500).json(error);
        }
    })
})

router.delete('/delete/:id',auth.authenticateToken,role.isAdmin,(request,response,next)=>{
    const id = request.params.id;
    var queryi = "delete from bill where id = ?";
    database.query(queryi,[id],(error,results)=>{
        if(!error){
            if(results.affectedRows ==0){
                return response.status(404).json({message:"bill id does not found!"});
            }
            else{
                return response.status(200).json({message:"bill deleted succesfully"});
            }
        }
        else{
            return response.status(500).json(error);
        }
    })
})

module.exports = router;