/*jshint esversion: 6 */
/*jslint node: true */

module.exports = (app) => {
    const notificationService = require('../controllers/notification.controller.js');

    // Create a new Note
    app.post('/notificationservice/sendMessage', notificationService.sendMessage);
    app.post('/notificationservice/notifyEmergency', notificationService.sendEmergencyNotification);
    app.post('/notificationservice/respondEmergency', notificationService.sendEmergencyResponse);
    app.post('/notificationservice/cancelEmergency', notificationService.cancelEmergency);
    
}