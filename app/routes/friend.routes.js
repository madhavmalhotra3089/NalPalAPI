/*jshint esversion: 6 */
/*jslint node: true */

module.exports = (app) => {
    const friendRequests = require('../controllers/friend.controller.js');

    // Create a new Note
    app.post('/friendservice/addfriend', friendRequests.addRequest);
    app.post('/friendservice/verifyFriend', friendRequests.acceptFriend);
    app.get('/friendservice/listFriends/:id', friendRequests.listFriends);
    app.get('/friendservice/listPendingRequests/:id', friendRequests.listPendingRequests);
}