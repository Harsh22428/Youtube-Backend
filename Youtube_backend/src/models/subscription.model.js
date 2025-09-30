import mongoose,{Schema, Types} from "mongoose";

const subscriptionSchema= new Schema({
subscriber:{
    type:mongoose.Types.ObjectId, // one who is subscribing
    ref:"User"
},
channel:{
    type:mongoose.Types.ObjectId, // one to whom 'subscriber' is subscribing
    ref:"User"
}
})

export const Subscription= mongoose.model("Subscription",subscriptionSchema)