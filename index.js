const express = require('express');
const dotenv = require('dotenv');
const connectDb = require('./Db.js')
const cusRoute = require('./routes.js')
const app= express();

app.use(express.urlencoded({extended:true}))
app.use(express.json());
dotenv.config();

const PORT = process.env.PORT || 3000 ;
connectDb();
app.get('/',(req,res)=>{
    console.log("Request send on / route");
    return res.status(200).json({
        message:"ALL GOOD!!!!"
    })
})
app.use('/cus',cusRoute)

app.listen(PORT,()=>{
    console.log(`Server has strated running at ${PORT} PORT`);
})

module.exports = app;