import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
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
  const { fullName, email, username, password,avatar } = req.body || {};
  // console.log(email);

  // validation of user
  if (
    [fullName, email, username, password].some((field) => {
      field?.trim() === "";
      // ya par field parameter deatails ko trim karke check kar rha hai ki kahi ye empty to nhi hai agar hai to throw a new error
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // checking existing users
  const existedUser = await User.findOne({
    // username
    // agar do field se check karna hai to then
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(400, "User is already exist");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const CoverImageLocalPath=req.files?.CoverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  const avatarResult = await uploadOnCloudinary(avatarLocalPath);
  const coverImageResult = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatarResult?.url) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatarResult.url,
    CoverImage: coverImageResult?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createuser = await User.findById(user._id) // isse hum check kar rhe hai user db me store hua ki nhi
    .select("-password -refreshToken").lean(); // ya par hum password aur refresh token ko hata rhe hai

  if (!createuser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createuser, "User registered successfully"),
    );
    //  console.log("req.files -->", req.files),
    //   console.log("avatarLocalPath -->", avatarLocalPath),
    //   console.log("avatarResult -->", avatarResult)
});

export { registerUser };



// import { ApiError } from "../utils/ApiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// const registerUser = asyncHandler(async (req, res) => {
//   const { fullName, email, username, password } = req.body || {};

//   if (
//     [fullName, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ email }, { username }],
//   });

//   if (existedUser) {
//     throw new ApiError(400, "User already exists");
//   }

//   const avatarLocalPath = req.files?.avatar?.[0]?.path;
//   let coverImageLocalPath;

//   if (
//     req.files &&
//     Array.isArray(req.files.coverImage) &&
//     req.files.coverImage.length > 0
//   ) {
//     coverImageLocalPath = req.files.coverImage[0].path;
//   }

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const avatarResult = await uploadOnCloudinary(avatarLocalPath);
//   const coverImageResult = coverImageLocalPath
//     ? await uploadOnCloudinary(coverImageLocalPath)
//     : null;

//   if (!avatarResult?.url) {
//     throw new ApiError(400, "Failed to upload avatar");
//   }

//   const user = await User.create({
//     fullName,
//     avatar: avatarResult.url,
//     coverImage: coverImageResult?.url || "",
//     email,
//     password,
//     username: username.toLowerCase(),
//   });

//   // ✅ Lean kara user ko to prevent circular structure
//   const createdUser = await User.findById(user._id)
//     .select("-password -refreshToken")
//     .lean();

//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while creating the user");
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(201, createdUser, "User registered successfully"));
// });

// export { registerUser };
