import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// express me url se data req.params se ata hai
const app = express();
// app.use(cors()) // main isi sara kaam ho jata hai but for production code
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))
app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import useRouter from './routes/user.routes.js'


// routes declaration
app.use("/api/v1/users",useRouter)

// http://localhost:8000/api/v1/users/register
export {app}