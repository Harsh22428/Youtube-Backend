import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went worng while generating refresh and access token"
    );
  }
};

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
  const { fullName, email, username, password, avatar } = req.body || {};
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
  console.log(req.files);
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
    .select("-password -refreshToken")
    .lean(); // ya par hum password aur refresh token ko hata rhe hai

  if (!createuser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createuser, "User registered successfully"));
  //  console.log("req.files -->", req.files),
  //   console.log("avatarLocalPath -->", avatarLocalPath),
  //   console.log("avatarResult -->", avatarResult)
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or password is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(400, "user does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credential");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options={
    httpOnly:true,
    secure:true
  }
  return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged Out "))
});

const refreshAccessToken= asyncHandler(async(req,res)=>{
  const incommingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
  if(incommingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }
  jwt.verify(incommingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
})


export { registerUser, loginUser, logoutUser };
