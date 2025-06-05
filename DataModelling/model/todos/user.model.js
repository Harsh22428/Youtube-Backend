import mongoose from "mongoose";


const userSchema= new mongoose.Schema(
    // {   // this is standard form of making model
    // username:String,
    // email:String,
    // isActive:Boolean
    // }
    {
        username:{
            type:String,
            required:true,  // it checks that username is present in database
            unique:true, // makes username , It is use in making instagram app like
            lowercase:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        password:{
           type:String,
           required:true,
           unique:true
        }
    },{timestamps:true}  
    // timestamps tell the when element is created or updated
)

export const User = mongoose.model("User",userSchema)

//  User convert in users in database 
// Interview question
// It simple mean this model {User} converts in plural form users with small letter  