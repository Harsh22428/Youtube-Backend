import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser =asyncHandler(async (req,res)=>{
    //     res.status(200).json({
    //       message:"ok"
    // })

    // user ka register
    
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username , email
    // check for images , check for avatar
    // upload them to cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res


    // get details from frontend
    const {fullName,email,username,password}=req.body
    // console.log(email);

    // validation of user
    if([fullName,email,username,password].some((field)=>{
        field?.trim()===""
        // ya par field parameter deatails ko trim karke check kar rha hai ki kahi ye empty to nhi hai agar hai to throw a new error
    })){
    throw new ApiError(400, "All fields are required")
    }

    // checking existing users
    const existedUser=User.findOne({
        // username
        // agar do field se check karna hai to then
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new ApiError(400,"User is already exist")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const CoverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
    const avatar= uploadOnCloudinary(avatarLocalPath)
    const coverImage =uploadOnCloudinary(CoverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createuser = User.findById(user._id) // isse hum check kar rhe hai user db me store hua ki nhi
    .select("-password -refreshToken" )  // ya par hum password aur refresh token ko hata rhe hai 


    if(!createuser){
        throw new ApiError(500,"something went wrong while registering the user");
    }
  return res.status(201).json(
    new ApiResponse(200,createuser,"User registered successfully")
  )
}) 

export {registerUser}