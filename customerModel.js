const mongoose = require ('mongoose')

const customerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
})

const customerModel = mongoose.model('Customer',customerSchema);

module.exports = customerModel;