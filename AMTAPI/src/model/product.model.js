import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

import moment from 'moment-timezone'
  

const ProductSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  productName_Id: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default:0
  },
  dop: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  monthId: {
    type: Number,
    required: true,
    default: new Date().getMonth()+1
  },
  payFrom: {
    type: Number,
    required: true,
  },
  dateId: {
    type: Number,
    required: true,
    default:new Date().getDate()
  },
  isActive: {
    type: Boolean,
    required: true,
    default:true
  },
  isDelete: {
    type: Boolean,
    required: true,
    default:true
  },
 
} ,{ timestamps: true },{delete:true});

ProductSchema.plugin(mongooseAggregatePaginate);

 


export const tproduct = mongoose.model("tproduct", ProductSchema);
