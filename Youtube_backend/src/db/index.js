import mongoose, { connect } from "mongoose";

import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST :${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection", error);
    process.exit(1); // this is concept of node js for exiting
  }
};

export default connectDB;
