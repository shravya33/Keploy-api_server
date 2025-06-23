const mongoose = require('mongoose');
const dotenv= require('dotenv');

dotenv.config()
const url= process.env.MONGODB_URl;

async function connectDb(){
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    try{
        await mongoose.connect(url);
        console.log("DATABASE CONNECTED !!")
    }
    catch(e){
        console.log("ERROR COULD NOT CONNECT TO DATABASE")
    }
}

module.exports = connectDb;