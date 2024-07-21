//import essential files and libraries
const express = require('express');
const database = require('../database')
const router = express.Router();
var auth = require('../services/authentication');
var role = require('../services/checkRole')


// api for adding new product in database
router.post('/add',auth.authenticateToken,role.isAdmin,(request,response)=>{
    let products = request.body;
    var queryi = "insert into products (name,categoryId,description,price,status) values (?,?,?,?,'true')";
    database.query(queryi,[products.name,products.categoryId,products.description,products.price],(error,results)=>{
        if(!error){
            return response.status(200).json({message:"products added succesfully"});   
        }
        else{
            return response.status(500).json(error);
        }
    })
})


//api for getting all the products stored in database
router.get('/get',auth.authenticateToken,(request,response,next)=>{
    var queryi = "select p.product_id,p.name,p.price,p.description,p.status,c.id as categoryId,c.name as categoryName from products as p INNER JOIN category as c where p.categoryId = c.id";
    database.query(queryi,(error,results)=>{
        if(!error){
            return response.status(200).json(results);
        }
        else{
            return response.status(500).json(error);
        }
    })
})


//api for getting all the products of particular category
router.get('/getByCategory/:id',auth.authenticateToken,(request,response,next)=>{
    const id = request.params.id;
    var queryi = "select product_id,name from products where categoryId=? and status = 'true'";
    database.query(queryi,[id],(error,results)=>{
        if(!error){
            return response.status(200).json(results);
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for getting a paritcular product details with its product id
router.get('/getById/:id',auth.authenticateToken,(request,response,next)=>{
    const id = request.params.id;
    var queryi = "select product_id,name,description,price from products where product_id=?";
    database.query(queryi,[id],(error,results)=>{
        if(!error){
            return response.status(200).json(results[0]);
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for updating product details
router.patch('/update',auth.authenticateToken,role.isAdmin,(request,response,next)=>{
    let products = request.body;
    var queryi = "update products set name =?,categoryId=?,description=?,price=? where product_id=?";
    database.query(queryi,[products.name,products.categoryId,products.description,products.price,products.product_id],(error,results)=>{
        if(!error){
            if(results.affectedRows ==0){
                return response.status(404).json({message:"products id does not found"});
            }
            return response.status(200).json({message:"products updated succesfully"});
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for deleting a particular product from database
router.delete('/delete/:id',auth.authenticateToken,role.isAdmin,(request,response,next)=>{
    const id = request.params.id;
    var queryi = "delete from products where product_id =?";
    database.query(queryi,[id],(error,results)=>{
        if(!error){
            if(results.affectedRows ==0){
                return response.status(404).json({message:"products id does not found"});
            }
            return response.status(200).json({message:"products deleted succesfully"});
        }
        else{
            return response.status(500).json(error);
        }
    })
})


//api for updating the product status
router.patch('/updateStatus',auth.authenticateToken,role.isAdmin,(request,response,next)=>{
    let user = request.body;
    var queryi = "update products set status = ? where product_id = ?";
    database.query(queryi,[user.status,user.id],(error,results)=>{
        if(!error){
            if(results.affectedRows ==0){
                return response.status(404).json({message:"products id does not found"});
            }
            return response.status(200).json({message:"products status updated succesfully"});
        }
        else{
            return response.status(500).json(error);
        }
    })
})

module.exports = router;