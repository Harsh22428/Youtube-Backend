const express=require('express');
const app=express();

const port =4000;

app.get('/',(req,res)=>{
res.send("welcome to backend revision")
})
app.get('/about',(req,res)=>{
    res.send("<h1>this backend revision</h1>")
})

app.listen(process.env.PORT,()=>{
    console.log(`app is listenning on the port ${port}`)
})