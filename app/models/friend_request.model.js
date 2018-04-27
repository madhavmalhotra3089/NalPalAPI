/*jshint esversion: 6 */
/*jslint node: true */

const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const Schema=mongoose.Schema;

const FriendRequestSchema = mongoose.Schema({
    requestor:{type:Schema.Types.ObjectId,ref:'User'},
    responder:{type:Schema.Types.ObjectId,ref:'User'}

}, {
    timestamps: true
});

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);