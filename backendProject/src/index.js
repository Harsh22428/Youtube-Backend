/* import mongoose from "mongoose";
import { DB_NAME } from "./constant";
import express from "express"
(async ()=>{
    try{
       await  mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("ERRR:",error);
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
       })
    }
    catch(error){
        console.error("ERROR:",error)
        throw err
    }
})()
    */

// import dotenv so that enviroment variable sab jagah pahuch jaye
// require('dotenv').config({path:'./env'})  // normal method isse code dikne me sahi nhi hai then we use professional 
import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config(
    {
        path:'./env'
    }
)

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on the port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDb connection failed !!",err)
})