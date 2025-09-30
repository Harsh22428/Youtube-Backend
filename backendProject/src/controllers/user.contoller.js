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
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incommingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodetoken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodetoken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshTokennewRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message, "Invalid Refresh token");
  }
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  // yaha ispasswordcorrect me await laga kyuki use function async me lika gaya hai
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password Changed successfully"));
});

const getCuurentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body; // yaha par file nhi le rhe update karne ke liye because iske liye alag code lika jayega kyuki update karte samay pura code up ho jayega
  if (!(fullName || email)) {
    throw new ApiError(400, "All fields are required");
  }
  const user = User.findByIdAndUpdate(
    req.user?.id,
    {
      // $set is use in mongoDb for updating or creating the old or new field
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "User Account details Updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is missing");
  }
  //  TODO: delete old image - assignment
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(401, "Error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar image is updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(401, "Error while uploading on coverImage");
  }
  // TODO:delete old image- assignment
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover Image is updated successfully"));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(401, "username is missing");
  }
  // console the channel                                                                   
  const channel = User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribTo",
      },
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        channelsSubscribedToCount:{
          $size:"$subscribTo"
        },
        isSubscribed:{
          $cond:{
            if:{$in:[req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false
          }
        } 
      }
    },
    {
      $project:{ // it will show all field in the frontend
        fullName:1,
        username:1,
        subscribersCount: 1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1
      }
    }
  ]);
  if(!channel?.length){
    throw new ApiError(401,"channel does not exist")
  }
  return res.status(200).
  json(new ApiResponse(200,channel[0],"user channel fetched successfully"))
});
const getWatchHistory=asyncHandler(async(req,res)=>{
  const user= await User.aggregate([
    {
      $match:{
        // 
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    }
  ])
})
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCuurentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile
};
