    /*jshint esversion: 6 */
    /*jslint node: true */

const Cloudant = require('@cloudant/cloudant');
const username = 'acturersomenigneredlyifl';
const password = 'dbe02d562eb4642d378d2a4df702c7691d89e361';
const url = `https://${username}:${password}@d4cc4da8-c892-414f-8f03-ed03594815ba-bluemix.cloudant.com`;

const cloudant = Cloudant(url, function (err, cloudant) {
    if (err) {
        console.log("Failed to initialize cloudant");
    } else {
        console.log("Cloudant Initialized Successfully for Friend Service");
    }
});


// Create and Save a new Note
exports.addRequest = (req, res) => {


    user={};

    if(req.body.username)
    {
        user.username=req.body.username;
    }

    if(req.body.mobile)
    {
        user.mobile=req.body.mobile;

    }

    if(req.body.email)
    {
        user.email=req.body.email;
    }

    users_db = cloudant.db.use('users');
    friend_requests_db=cloudant.db.use('friendrequests');

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
        if (result.docs.length == 0) {
            return res.status(500).send({
                status: "Error",
                message: "Could not find a friend with the input username/email/mobile"
            });
        }

        else{

            friend_requests_db.insert({
                requestorID:req.body.id,
                responderID:result.docs[0]._id,
                isAccepted:false,
                nickname:req.body.nickname
            },
                function (err, data) {
                    if (err) {
                        return res.status(500).send({
                            status: "Error occurred while creating a friend request",
                            message: err
                        });
                    } else {
                        return res.status(200).send({
                            status: "Success",
                            message: "Friend request sent successfully"
                        });

                    }
                });


            
        }


    });



};




exports.acceptFriend = (req, res) => {

    friend_requests_db=cloudant.db.use('friendrequests');
    friends_db=cloudant.db.use('friends');

    friend_requests_db.find({
        selector: {
            requestorID: req.body.requestorID,
            responderID: req.body.responderID
        }
    }, function (er, result) {

        if (er) {
            return res.status(500).send({
                status: "Error occurred in the operation",
                message: err
            });
        }

        friend_requests_db.insert({
            _id:result.docs[0]._id,
            isAccepted:true,
            requestorID:req.body.requestorID,
            responderID:req.body.responderID,
            _rev:result.docs[0]._rev,
            nickname:result.docs[0].nickname
        },
            function (err, data) {
                if (err) {
                    return res.status(500).send({
                        status: "Error occurred while confirming a friend request",
                        message: err
                    });
                } else {
                    friends_db.insert({
                        requestorID:req.body.requestorID,
                        responderID:req.body.responderID,
                        nickname:result.docs[0].nickname
                    },
                        function (err, data) {
                            if (err) {
                                return res.status(500).send({
                                    status: "Error occurred while verifying a friend request",
                                    message: err
                                });
                            } else {
                                return res.status(200).send({
                                    status: "Success",
                                    message: "Friend  verified successfully"
                                });
            
                            }
                        });

                }
            });



    });


};

exports.listFriends=(req,res)=>
{

    friends_db=cloudant.db.use('friends');
    friends_arr=[]
    var id=req.params.id;

    friends_db.find({
        selector: {
            "$or": [
                {
                    requestorID:id
                },{
                    responderID:id
                }
            ],
        }
    }, function (er, result) {

        if (er) {
            return res.status(500).send({
                status: "Error occurred in fetching the list of friends",
                message: err
            });
        }

        for(i=0;i<result.docs.length;i++)
        {   
            let friendID="";
            if(result.docs[i].requestorID==id)
            {
                friendID=result.docs[i].responderID;
            }
            else
            {
                friendID=result.docs[i].requestorID;
            }
            friends_arr.push({
                friendID:friendID,
                nickname:result.docs[i].nickname

            });
        }
        return res.status(200).send({
            status: "Retrieved the list of friends",
            data: friends_arr 
        });

    }
);

    
    



};

exports.listPendingRequests=(req,res)=>
{

    friend_requests_db=cloudant.db.use('friendrequests');
    users_db=cloudant.db.use("users");
    friends_arr=[]
    friends_id_arr=[]
    var id=req.params.id;

    friend_requests_db.find({
        selector: {
          responderID:id,
          isAccepted:false
        }
    }, function (er, result) {

        if (er) {
            
            return res.status(500).send({
                status: "Error occurred in fetching the list of pending friends",
                message: err
            });
        }
    
        for(i=0;i<result.docs.length;i++)
        {   
            friends_id_arr.push(result.docs[i].requestorID);
        }
        
        users_db.find({
            selector:{ "_id":{
                "$in":friends_id_arr
            }}
        },function (er, result) {
            
            if (er) {
                 res.status(500).send({
                    status: "Error occurred in fetching the list of pending friends",
                    message: er
                });

                
            }

            
            for(i=0;i<result.docs.length;i++)
        {   
            friends_arr.push({
                mobile:result.docs[i].mobile,
                email:result.docs[i].email,
                id:result.docs[i]._id
            });
        }
        return res.status(200).send({
            status: "Retrieved the list of pending friend requests",
            data: friends_arr 
        });

        });



        

    }
);

    
    



};