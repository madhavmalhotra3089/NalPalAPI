/*jshint esversion: 6 */
/*jslint node: true */

module.exports = (app) => {
    const friendRequests = require('../controllers/friend_request.controller.js');

    // Create a new Note
    app.post('/friendrequests', friendRequests.create);

}