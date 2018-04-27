/*jshint esversion: 6 */
/*jslint node: true */

module.exports = (app) => {
    const users = require('../controllers/user.controller.js');

    // Create a new Note
    app.post('/userservice/registerUser', users.registerUser);
    app.post('/userservice/login',users.login);
    app.post('/userservice/updateUserInformation',users.updateUserInformation);
}