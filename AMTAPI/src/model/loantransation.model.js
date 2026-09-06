import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const laonTransationSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    loanAccountId: {
      type: Schema.Types.ObjectId,
      ref: "LoanAccount",
      require: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    createdTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    amount: {
      type: Number,
      default: 0,
      required: true,
    },
    depositedDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    payFrom: {
      type: Number,
      required: true,
      default: 0,
    },
    transationType: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      default: 'Loan',
    },
  },
  { timestamps: true }
);

laonTransationSchema.plugin(mongooseAggregatePaginate);

export const LoanTransation = mongoose.model(
  "LoanTransation",
  laonTransationSchema
);
