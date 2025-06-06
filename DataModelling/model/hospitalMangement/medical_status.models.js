import mongoose, { Mongoose } from "mongoose";

const medicalSchema= new Mongoose.Schema({},{timestamps:true})


export const Medical = mongoose.model("Medical",medicalSchema)