/*jshint esversion: 6 */
/*jslint node: true */

const express = require('express');
const bodyParser=require('body-parser');
const dbConfig=require('./config/database.config');
const mongoose=require('mongoose');

let app=express();

app.use(bodyParser.json());

mongoose.Promise=global.Promise;

mongoose.connect(dbConfig.url).then(()=>
{
    console.log("Successfully connected to the database");
}).catch((err)=>{
    console.log("Could not connect to the database");
    console.log(err);
});


require('./app/routes/user.routes.js')(app);

app.get('/', (req, res) => {
    
    res.json({"message": "Welcome to the NAL-PAL application backend API."});
});


// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});