const customerModel =require('./customerModel.js')


const createUser = async(req,res)=>{
    try{
        const {name,email,age}= req.body;
        if(!name || !email || !age){
            return res.status(401).json({
                message:"Please Provide All the Fields"
            })
        }
        const existCus = await customerModel.findOne({email});
        if(existCus){
            return res.status(401).json({
                message:"You Already Exist Edit your details"
            })
        }
        const newcust = new customerModel({
            name,
            email,
            age
        })

        await newcust.save();
        return res.status(201).json({
            success:true,
            message:"Customer Has Been Added",
            customer:{
                name:newcust.name,
                email:newcust.email,
                age:newcust.age
            }
        })
    }
    catch(e){
        return res.status(501).json({
            message:"Could Not create a user"
        })
    }
}  

const getCustomer = async(req,res)=>{
    try{
        const customer = await customerModel.find();
        return res.status(201).json({
            success:true,
            message:"Customer are this",
            count:customer.length,
            customers:customer.map(cus=>({
                id:cus._id,
                name:cus.name,
                email:cus.email,
                age:cus.age
            }))
        })
    }
    catch(e){
        return res.status(501).json({
            message:"Get User Could not be fullfilled"
        })
    }
}
const customerupdate =async(req,res)=>{
    try{
        const {id} = req.params
        const {name,email,age}=req.body;

        const customer = await customerModel.findByIdAndUpdate(
            id,
            {
                name,
                email,
                age
            },
            {
                new:true,
                runValidators:true
            }
        );
        return res.status(201).json({
            success:true,
            message:"customer updated",
            details:{
                name:customer.name,
                email:customer.email,
                age:customer.age,
            }
        })
      
       
    }
    catch(e){
        return res.status(501).json({
            message:"Could not Update"
        })
    }
}
const customerDelete =async(req,res)=>{
    try{
        const {id}= req.params;
        const customer = await customerModel.findByIdAndDelete(id);
        return res.status(201).json({
            success:true,
            message:"Customer Deleted",
            deleted:{
                name:customer.name,
            }
        })
    }
    catch(e){
        return res.status(501).json({
            message:"Could not delete"
        })
    }
}


module.exports = {
    createUser,
    getCustomer,
    customerupdate,
    customerDelete
}