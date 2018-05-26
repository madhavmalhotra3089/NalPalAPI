/*jshint esversion: 6 */
/*jslint node: true */


const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const Cloudant = require('@cloudant/cloudant');
const username = 'acturersomenigneredlyifl';
const password = 'dbe02d562eb4642d378d2a4df702c7691d89e361';
const url = `https://${username}:${password}@d4cc4da8-c892-414f-8f03-ed03594815ba-bluemix.cloudant.com`;

const cloudant = Cloudant(url, function (err, cloudant) {
    if (err) {
        console.log("Failed to initialize cloudant");
    } else {
        console.log("Cloudant Initialized Successfully");
    }
});


exports.registerUser = (req, res) => {


    users_db = cloudant.db.use('users');



    var user = {
        username: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile

    }





    users_db.find({
        selector: {
            username: user.username,
            email: user.email,
            mobile: user.mobile
        }
    }, function (er, result) {

        if (er) {
            return res.status(500).send({
                status: "Error occurred in the operation",
                message: err
            });
        }
        if (result.docs.length > 0) {
            return res.status(500).send({
                status: "Error",
                message: "Username/Mobile/Email already exists"
            });
        }


    });

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return res.status(500).send({
            status: "Error Occurred during the operation.",
        });

        // hash the password along with our new salt
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) return res.status(500).send({
                status: "Error Occurred during the operation.",
            });

            user.password = hash;
            users_db.insert(user,
                function (err, data) {
                    if (err) {
                        return res.status(500).send({
                            status: "Error occurred while saving the user information in the database",
                            message: err
                        });
                    } else {
                        res.send({
                            id: data.id,
                            rev: data.rev
                        });

                    }
                });

        });
    });


};


exports.login = (req, res) => {

    var user = {
        username: req.body.username
    }
    users_db = cloudant.db.use('users');
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return res.status(500).send({
            status: "Error Occurred during the operation.",
        });



        // hash the password along with our new salt
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) return res.status(500).send({
                status: "Error Occurred during the operation.",
            });

            user.password = hash;


            users_db.find({
                selector: {
                    username: user.username
                }
            }, function (er, result) {
                if (er) {
                    throw er;
                }

                if (result.docs.length == 0) {
                    return res.status(403).send({
                        status: "Login Failed",
                        message: "Invalid Username"
                    });
                } else {
                    bcrypt.compare(req.body.password, result.docs[0].password, function (err, isMatch) {

                        if (isMatch) {
                            res.send({
                                status: "Login Successful",
                                id: result.docs[0]._id,
                                rev: result.docs[0]._rev
                            });
                        }

                        else
                        {
                            return res.status(403).send({
                                status: "Login Failed",
                                message: "Invalid Username/Password Combination"
                            }); 
                        }

                    });

                }

            });


        });
    });






};



exports.updateUserInformation = (req, res) => {

    users_db = cloudant.db.use('users');
    var user = {
        _id: req.body.id,
        username: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password,
        _rev: req.body.rev


    }

    users_db.find({
        selector: {
            _id: user._id
        }
    }, function (er, result) {

        if (er) {
            return res.status(500).send({
                status: "Error occurred in the operation",
                message: err
            });
        }
        if (result.docs.length == 0) {
            return res.status(500).send({
                status: "Error",
                message: "No user found with this id"
            });
        } else {
            users_db.insert(user,
                function (err, data) {
                    if (err) {
                        return res.status(500).send({
                            status: "Error occurred while updating the user information in the database",
                            message: err
                        });
                    } else {
                        res.send({
                            id: data.id,
                            rev: data.rev
                        });

                    }
                });


        }


    });




};