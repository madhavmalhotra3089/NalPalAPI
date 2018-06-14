    /*jshint esversion: 6 */
    /*jslint node: true */

    var PushNotifications = require('ibm-push-notifications').PushNotifications;
    var Notification = require('ibm-push-notifications').Notification;
    var PushMessageBuilder = require('ibm-push-notifications').PushMessageBuilder;
    

    var myPushNotifications = new PushNotifications(PushNotifications.Region.US_SOUTH, "081691fb-4ead-4f3d-b570-e64fd9e57d1b", "ff382ab8-0c20-42aa-a70a-f79ebd851947");

    const Cloudant = require('@cloudant/cloudant');
    const username = 'acturersomenigneredlyifl';
    const password = 'dbe02d562eb4642d378d2a4df702c7691d89e361';
    const url = `https://${username}:${password}@d4cc4da8-c892-414f-8f03-ed03594815ba-bluemix.cloudant.com`;

    const cloudant = Cloudant(url, function (err, cloudant) {
        if (err) {
            console.log("Failed to initialize cloudant");
        } else {
            console.log("Cloudant Initialized Successfully for Notification Service");
        }
    });

    exports.sendMessage = (req, res) => {


        messageObj = {};
        messageObj.type = "message";
        messageObj.priority = "normal";
        messageObj.body = req.body.message;

        users = req.body.users;

        var message = PushMessageBuilder.Message.alert(JSON.stringify(messageObj)).build();

        var target = PushMessageBuilder.Target.userIds(users).build();

        var notificationMessage = Notification.message(message)
            .target(target).build();

        myPushNotifications.send(notificationMessage, function (error, response, body) {

            if (error) res.status(500).send({
                status: "Message sending failed"
            });
            return res.status(response.statusCode).send({
                message: response.body.message || "Message sent successfully"
            });

        });





    };


    exports.sendEmergencyNotification = (req, res) => {
        friends_db = cloudant.db.use('friends');
        friends_arr = []
        var id = req.body.id;

        friends_db.find({
            selector: {
                "$or": [{
                    requestorID: id
                }, {
                    responderID: id
                }],
            }
        }, function (er, result) {

            if (er) {
                return res.status(500).send({
                    status: "Error occurred in fetching the list of friends",
                    message: err
                });
            }

            for (i = 0; i < result.docs.length; i++) {
                let friendID = "";
                if (result.docs[i].requestorID == id) {
                    friendID = result.docs[i].responderID;
                } else {
                    friendID = result.docs[i].requestorID;
                }
                friends_arr.push(friendID);

                messageObj = {};
                messageObj.type = "notification";
                messageObj.priority = "emergencyrequest";
                messageObj.lat=req.body.lat;
                messageObj.lon=req.body.lon;


                var message = PushMessageBuilder.Message.alert(JSON.stringify(messageObj)).build();

                var target = PushMessageBuilder.Target.userIds(friends_arr).build();

                var notificationMessage = Notification.message(message)
                    .target(target).build();

                myPushNotifications.send(notificationMessage, function (error, response, body) {

                    if (error) res.status(500).send({
                        status: "Message sending failed"
                    });

                    emergency_db = cloudant.db.use('emergency');
                    emergency={}
                    emergency.intiatorID=req.body.id;
                    emergency.isActive=true;

                    
                    emergency_db.insert(emergency,
                    function (err, data) {
                        if (err) {
                            return res.status(500).send({
                                status: "Error occurred sending emergency information",
                                message: err
                            });
                        } else {
                            return res.status(response.statusCode).send({
                                message: response.body.message || "Emergency sent successfully",
                                emergencyID:data.id

                            });

                        }
                    });



                    

                });

            }



        });



    };

    exports.sendEmergencyResponse = (req, res) => {
        messageObj = {};
        messageObj.type = "notification";
        messageObj.priority = "emergencyresponse";
        messageObj.body = req.body.message;
        messageObj.duration=req.body.duration;

        user = [req.body.intiatorID];

        var message = PushMessageBuilder.Message.alert(JSON.stringify(messageObj)).build();

        var target = PushMessageBuilder.Target.userIds(user).build();

        var notificationMessage = Notification.message(message)
            .target(target).build();

        myPushNotifications.send(notificationMessage, function (error, response, body) {

            if (error) res.status(500).send({
                status: "Message sending failed"
            });

            



            emergency_db = cloudant.db.use('emergency');
            emergency_response_db=cloudant.db.use('emergencyresponses');

            emergency_db.find({
                selector: {
                    intiatorID: req.body.intiatorID,
                    isActive:true
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
                        message: "No Active emergency in progress"
                    });
                }
                else{
                    emergency_response={}
                    emergency_response.responderID=req.body.id;
                    emergency_response.emergencyID=result.docs[0]._id;

                    emergency_response_db.insert(emergency_response,
                        function (err, data) {
                            if (err) {
                                return res.status(500).send({
                                    status: "Error occurred updating emergency information",
                                    message: err
                                });
                            } else {
                                return res.status(response.statusCode).send({
                                    message: response.body.message || "Responded to emergency successfully"
    
                                });
                                
                            }
                        });

                }



            });


          

        });



    };


    exports.cancelEmergency=(req,res)=>{


        emergency_response_db=cloudant.db.use('emergencyresponses');


        emergency_response_db.find({
            selector: {
                emergencyID: req.body.emergencyID,
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
                    message: "No emergency for this Id"
                });
            }
            else{
                responders=[];

                for (i = 0; i < result.docs.length; i++) {
                    let friendID = result.docs[i].responderID;
                    
                    responders.push(friendID);
    
                    messageObj = {};
                    messageObj.type = "notification";
                    messageObj.priority = "cancelemergency";
    
    
                    var message = PushMessageBuilder.Message.alert(JSON.stringify(messageObj)).build();
    
                    var target = PushMessageBuilder.Target.userIds(responders).build();
    
                    var notificationMessage = Notification.message(message)
                        .target(target).build();
    
                    myPushNotifications.send(notificationMessage, function (error, response, body) {
    
                        if (error) res.status(500).send({
                            status: "Message sending failed"
                        });
    
                        emergency_db=cloudant.db.use('emergency');
                        
                        emergency_db.find({
                            selector: {
                                _id: req.body.emergencyID,
                                isActive:true
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
                                    message: "No emergency found with this id"
                                });
                            } else {
                                emergency={}
                                emergency._id=req.body.emergencyID;
                                emergency._rev=result.docs[0]._rev;
                                emergency.intiatorID=result.docs[0].intiatorID;
                                emergency.isActive=false;
                                emergency_db.insert(emergency,
                                    function (err, data) {
                                        if (err) {
                                            return res.status(500).send({
                                                status: "Error occurred while updating the user information in the database",
                                                message: err
                                            });
                                        } else {
                                            res.send({
                                                status: "Emergency cancelled successfully.",
                                            });
                
                                        }
                                    });
                
                
                            }
                
                
                        });
    
                    });
    
                }
    

            };


        });

    }