/*jshint esversion: 6 */
/*jslint node: true */

const FriendRequest = require('../models/friend_request.model.js');



// Create and Save a new Note
exports.create = (req, res) => {



    
    const friendRequest = new FriendRequest({
        requestor: req.body.requestor, 
        responder: req.body.responder,
    });

    // Save Note in the database
    friendRequest.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while saving a friend request."
        });
    });

};
