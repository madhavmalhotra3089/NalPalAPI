/*jshint esversion: 6 */
/*jslint node: true */

const express = require('express');
const bodyParser=require('body-parser');
const cors=require('cors');




let app=express();

app.use(bodyParser.json());
app.use(cors());


require('./app/routes/user.routes.js')(app);

require('./app/routes/friend.routes.js')(app);

require('./app/routes/notification.routes.js')(app);

app.get('/', (req, res) => {
    
    res.json({"message": "Welcome to the NAL-PAL application backend API."});
});


// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});