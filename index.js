const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('config');
const dbCon = config.get('DB_CONNECTION.host');

//connect
mongoose.connect(dbCon,
    { useNewUrlParser: true, useUnifiedTopology: true }, () => 
       console.log('connected to DB')
);

//Import Routes
const authRoute = require('./routes/auth');
const userProfileRoute = require('./routes/userProfile');

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true})),
app.use('/api/user', authRoute );
app.use('/api/profile', userProfileRoute);


//ROUTES
app.get('/', (req,res) => {
    res.send('We are on home');
});




//Listen
app.listen(3000);