import mongoose from "mongoose";

const doctorSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    salary:{
        type:Number,
        required:true
    },
    qualification:{
        type:String,
        required:true
    },
    experienceYears:{
        type:Number,
        required:true
    },
    workInHospitals:[
        {  // number hospitals where doctor worked different time
            // here we add schema of working of doctors in differnt hospitals
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospitals "
         }
]
},{timestamps:true})

export const Doctor=mongoose.model("Doctor",doctorSchema)