import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 

const laonAccountSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require:true
  },
  accountname:{
    type:String,
    require:true,
    default:'one to one'
  },
  
  totalamount: {
    type: Number,
    default:0,
    required: true,
  },
  sendamount: {
    type: Number,
    default:0,
    required: true,
  },
   receiveamount: {
    type: Number,
    default:0,
    required: true,
  },
   payamount: {
    type: Number,
    default:0,
    required: true,
  },
  accountfrom: {
    type: Date,
    required: true,
    default:   Date.now()
  },
  accountto: {
    type: Date,
    required: true,
    default:   Date() 
  },
  isActive: {
    type: Boolean,
    required: true,
    default:true
  },
  transactionCount: {
    type: Number,
    required: true,
    default:0
  },
  isDelete: {
    type: Boolean,
    required: true,
    default:true
  },
 
} ,{ timestamps: true });

laonAccountSchema.plugin(mongooseAggregatePaginate);


export const LoanAccount = mongoose.model("LoanAccount", laonAccountSchema);
