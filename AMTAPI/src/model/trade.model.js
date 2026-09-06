import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tradeSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tradeSector: {
      type: Number,
      default: 1,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
      required: true,
    },
    buyAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    sellAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  
 
} ,{ timestamps: true });

tradeSchema.plugin(mongooseAggregatePaginate);


export const Trade = mongoose.model("Trade", tradeSchema);
