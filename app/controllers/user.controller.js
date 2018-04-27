/*jshint esversion: 6 */
/*jslint node: true */

const User = require('../models/user.model.js');
const bcrypt=require('bcrypt');
const SALT_WORK_FACTOR=10;

// Create and Save a new Note
exports.registerUser = (req, res) => {

    User.findOne({$or:[{'userName':req.body.userName},{'email':req.body.email},{'mobile':req.body.mobile}]},'userName',(err,user)=>{

        if(user)
        {
            return res.status(500).send({
                status:"Error",
                message: "Username/Mobile/Email already exists"
            });
    
        }
        
        else{
            const user = new User({
                userName: req.body.userName, 
                email: req.body.email,
                mobile:req.body.mobile,
                password:req.body.password,
                hasNalaxone:req.body.hasNalaxone,
            });
        
            // Save Note in the database
            user.save()
            .then(data => {
                res.send({id:data._id,password:data.password});
            }).catch(err => {
               
                return res.status(500).send({
                    status:"Error",
                    message: err.message || "Error occurred while creating a user."
                });
        
        
        
            });
        }

    });

   
    
    

};


exports.login = (req, res) => {

    User.findOne({ userName: req.body.userName },'userName password', function(err, user) {
        

        if(err) 
        {
            return res.send({status:"Login Failed",message:err.message});
        }
        
        if(user){
     
        user.comparePassword(req.body.password, function(err, isMatch) {
            if(err) 
        {
            return res.send({status:"Login Failed",message:err.message});
        }


            if(isMatch)
            {
                return res.send({status:"Login Successful",id:user._id});
            }
            else
            {
                return res.send({status:"Login Failed",message:"Invalid Password"});
            }
        });

    }
        else{
            return res.send({status:"Login Failed",message:"Invalid Username"});
        }

    });
    

};



exports.updateUserInformation = (req, res) => {


    
    User.findByIdAndUpdate(req.body.id,{
        userName:req.body.userName,
        mobile:req.body.mobile,
        email:req.body.email,
        hasNalaxone:req.body.hasNalaxone,
        password:req.body.password
    },{new:false}).then(user=>{
            if(!user)
            {
                return res.status(404).send({
                    message: "User not found with id " + req.body.id
                });
            }
           

            return res.status(200).send({
                status: "User updated"
            });



    }).catch(err=>{

        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.body.id
            });                
        }
        return res.status(500).send({
            message: "Error updating user with id " + req.body.id
        });

    });

   
    
    

};