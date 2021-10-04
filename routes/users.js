const express = require('express');
const router = express.Router();
const bycrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated,  forwardAuthenticated} = require('../config/auth');


//User Model
const User = require('../models/User');

//login page
//router.get('/login',forwardAuthenticated, (req,res) => res.render('login'));

//Register page
router.get('/register',forwardAuthenticated, (req,res) => res.render('signup'));



//Register Handle
router.post('/register', (req,res) =>{
    const {name, email, password, password2} = req.body;
    let errors = [];

    //Check Required Fields
    if(!name || !email || !password || !password2){
        errors.push({msg: 'Please fill in the fields'});
    }

    if(password != password2){
        errors.push({msg: 'Please enter Password Correctly'});
    }

    if(password.length < 6){
        
        errors.push({msg: 'Please should be atleast 6 characters'});
    }
    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });

    }else{
        //Validation PAss
        User.findOne({
            email : email
        }).then(user => {
            if(user){
                //User Exists
                errors.push({msg: 'Email is already Registered'});

                res.render('register',{
                    errors,
                    name,
                    email,
                    password,
                    password2
                });

            } else{
                const newUser = new User({
                    name: name,
                    email: email,
                    password:password
                });
              

                //Hash Password
                bycrypt.genSalt(10, (err, salt) => 
                    bycrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err) throw err;
                        //Set Password to hash
                        newUser.password = hash;
                        //Save User
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg','You are now Registered!')
                            res.redirect('/');
                        })
                        .catch(err => console.log(err));
                }))

            }
        });
    }
});

// //Login Handle
// router.post('/login', (req,res,next)=>{
//     passport.authenticate('local', {
//         successRedirect: '/dashboard',
//         failureRedirect:'/users/login',
//         failureFlash: true

//     })(req,res,next);
// })

//Logout Handle
router.get('/logout', (req,res) =>{
    req.logOut();
    req.flash('success-msg','You are Logged out');
    res.redirect('/');
})

module.exports = router;