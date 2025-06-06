import mongoose, { Mongoose } from "mongoose";

const patientSchema= new Mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    diagonsedwith:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    bloodgroup:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        enum:["M","F","O"],
        required:true
    },
    admittedIn:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital"
    }
},{timestamps:true})


export const Patient = mongoose.model("Patient",patientSchema)