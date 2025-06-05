import mongoose, { Types } from "mongoose";

const todoSchema=mongoose.Schema({
 content:{
    type:String,
    required:true
 },
 complete:{
    type:Boolean,
    default:false
 },
 createdBy:{
    type:mongoose.Schema.Types.ObjectId, // jab bhi hamara type dusre folder me ho then we follow these syntax 
    ref:"User"   // here reference is taken from User 
 },
 subtodo:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubTodo" // array of subtodo
    }
 ]
},
{timestamps:true}
)

export const Todo=mongoose.model("Todo",todoSchema)