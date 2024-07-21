//importing essential files and libraries
const express = require('express');
const database = require('../database');
const router = express.Router();

//we are using jsonwebtoken jwt for authenticating the user.
const jwt = require('jsonwebtoken');
//we are using nodemailer to send mails, of forget password to users.
const nodemailer = require('nodemailer');
// .env for saving enviornment data.
require('dotenv').config();

//importing authentication and role files from services folder
var authentication = require('../services/authentication');
var role = require('../services/checkRole');

//creating api for signup
router.post('/signup',(request,response)=>{
    //hitting mysql query to database and checking for error and responses.
    let user = request.body;
    queryy = "select email,password,role,status from user where email =?"
    //only one user is allowed with one email so checking weither this email is already registered or not.
    database.query(queryy,[user.email],(error,results)=>{
        if(!error){
            //if no one with this email is already there registering them.
            if(results.length<=0){
                queryi = "insert into user(name,contactNumber,email, password,status,role) values(?,?,?,?,'false','user')"
                database.query(queryi,[user.name,user.contactNumber,user.email,user.password],(error,results)=>{
                    if(!error){
                        return response.status(200).json({message: "Successfully Registered, waiting for admin approval"});
                    }
                    else{
                        return response.status(500).json(error);
                    }

                })
            }
            //else displaying message already registered
            else
            {
                return response.status(400).json({message : "Already Registered with this Email"});
            }
        }
        else{
            return response.status(500).json(error)
        }
    });
})

//creating api for login
router.post('/login',(request,response)=>{
    const user = request.body;
    queryi = "select email,password,role,status from user where email = ?";
    database.query(queryi,[user.email],(error,results)=>{
        if(!error){
            //if no user with given email, showing incorrect username or password
            if(results.length<=0||results[0].password!=user.password){
                return response.status(401).json({message:"Incorrect username or password"});
            }
            //if user is not verified by admin, displaying message
            else if(results[0].status== 'false'){
                return response.status(401).json({message:"wait for admin approval"});
            }
            //incase of correct password making a jwt token containg email and role and returning it.
            else if(results[0].password==user.password){            
                const data = { email: results[0].email, role : results[0].role}
                const accessToken = jwt.sign(data,process.env.ACCESS_TOKEN_KEY,{expiresIn:'8h'})
                response.status(200).json({token: accessToken});
            }
            else{
                return response.status(400).json({message:"something went wrong . please try again later"});
            }
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//creating a mailer object to send emails.
var mailer = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

//making an api for forgot Password
router.post('/forgotPassword',(request,response)=>{
    const user = request.body;
    queryi = "select email,password from user where email = ?";
    database.query(queryi,[user.email],(error,results)=>{
        if(!error){
            if(results.length<=0){
                //we are also sending success message even if the email is not there, for security reasons
                return response.status(200).json({messsage:"password sent successfully to your mail"});
            }
            else{
                //actually send password to thier email address
                //send password to their email address
                var mailOptions ={
                    from : process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by Dairy shop Management System',
                    html : '<p><b> Your login details for Dairy shop Management System are : </b><br><b>Email : </b>'+results[0].email+'<br><b>Password : </b>'+results[0].password+'<br></p>'
                };
                mailer.sendMail(mailOptions,function(error,info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log('Email sent : '+info.response);
                    }
                });
                return response.status(200).json({messsage:"password sent successfully to your mail"});
            }
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for getting information about all the users.
router.get('/get',authentication.authenticateToken,role.isAdmin,(request,response)=>{
    var queryi = "select id,name,email,contactNumber,status from user where role='user'";
    database.query(queryi,(error,results)=>{
        if(!error){
            return response.status(200).json(results);
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for getting name of loged in user.
router.get('/getName',authentication.authenticateToken,(request,response)=>{
    const email = response.locals.email;
    var queryi = "select name from user where email = ?";
    database.query(queryi,[email],(error,results)=>{
        if(!error){
            return response.status(200).json(results[0].name);
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for updating role of user
router.patch('/update',authentication.authenticateToken,role.isAdmin,(request,response)=>{
    let user = request.body;
    var queryi = "update user set status =? where id = ?";
    database.query(queryi,[user.status,user.id],(error,results)=>{
        if(!error){
            if(results.affectedRows ==0){
                return response.status(404).json({message : "user id does not exist"});
            }
            if(user.status=="true"){
                return response.status(200).json({message : "user succesfully verified"});
            }
            else{
                return response.status(200).json({message : "user succesfully unauthorized"});
            }
        }
        else{
            return response.status(500).json(error);
        }
    })
})

//api for checking token
router.get('/checkToken',authentication.authenticateToken,(request,response)=>{
    return response.status(200).json({message: "true"});
})

//api for changing password
router.post('/changePassword',authentication.authenticateToken,(request,response)=>{
    const user = request.body;
    const email = response.locals.email;
    var queryi = "select * from user where email = ? and password =?";
    database.query(queryi,[email,user.oldPassword],(error,results)=>{
        if(!error){
            if(results.length<=0){
                return response.status(400).json({message : "incorrect old password"});
            }
            else if(results[0].password == user.oldPassword){
                queryi = "update user set password =? where email = ?";
                database.query(queryi,[user.confirmPassword,email],(error,results)=>{
                    if(!error){
                        return response.status(200).json({message : "Password updated Succesfully."});
                    }
                    else{
                        return response.status(500).json(error);
                    }
                })
            }
            else{
                return response.status(400).json({message: "something went wrong please try again later!"})
            }
        }
        else{
            return response.status(500).json(error);
        }
    })
})
module.exports = router;
