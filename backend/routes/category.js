//importing essential files and libraries
const express = require('express');
const database = require('../database');
const router = express.Router();

// importing role and auth files
var auth = require('../services/authentication');
var role = require('../services/checkRole');


//api for adding new category in database
router.post('/add',auth.authenticateToken,role.isAdmin,(request,response,next)=>{
    let category = request.body;
    queryi = "insert into category (name) values (?)";
    database.query(queryi,[category.name],(error,results)=>{
        if(!error){
            return response.status(200).json({message: "category added succesfully"});
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for getting all the category in database
router.get('/get',auth.authenticateToken,(request,response,next)=>{
    var queryi = "select * from category order by name";
    database.query(queryi,(error,results)=>{
        if(!error){
            return response.status(200).json(results);
        }
        else{
            return response.status(500).json(error);
        }
    })
})


//api for updating category 
router.patch('/update',auth.authenticateToken,role.isAdmin,(request,response,next)=>{
    let products = request.body;
    var queryi = "update category set name =? where id=?";
    database.query(queryi,[products.name,products.id],(error,results)=>{
        if(!error){
            if(results.affectedRows ==0){
                return response.status(404).json({message:"Category id does not found"});
            }
            return response.status(200).json({message:"category updated succesfully"});
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for deleting a particular category from database with the help of id
router.delete('/delete/:id',auth.authenticateToken,role.isAdmin,(request,response,next)=>{
    const id = request.params.id;
    var queryi = "delete from category where id =?";
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

module.exports = router;