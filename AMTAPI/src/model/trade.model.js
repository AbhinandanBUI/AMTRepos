import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Counter } from "./counter.model.js";

const TradeSchema = new Schema(
    {
        tradeId: {
            type: Number,
            unique: true,
        },
        indexName: {
            type: String,
            required: true,
        },
        lotsize: {
            type: Number,
            required: true,
        },
        bugAmount: {
            type: Number,
            required: true,
        },
        sellAmount: {
            type: Number,
            required: true,
        },
        pandlAmount: {
            type: Number,
            required: true,
        },
        notes: {
            type: String,
            required: false,
        },

        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },

        createdByUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

TradeSchema.pre("save", async function (next) {

    if (!this.isNew) {
        return next();
    }

    const counter = await Counter.findOneAndUpdate(
        { _id: "tradeId" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true,
        }
    );

    this.tradeId = counter.seq;

    next();
});

TradeSchema.plugin(mongooseAggregatePaginate);

export const Trade = mongoose.model("Trade", TradeSchema);