import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Counter } from "../counter.model.js";

const workItemSchema = new Schema(
    {
        workItemId: {
            type: Number,
            unique: true,
        },
        name: {
            type: String,
            required: true,
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

workItemSchema.pre("save", async function (next) {
    if (!this.isNew) {
        return next();
    }
    const counter = await Counter.findOneAndUpdate(
        { _id: "workItemId" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true,
        }
    );
    this.workItemId = counter.seq;
    next();
});

workItemSchema.plugin(mongooseAggregatePaginate);

export const WorkItem = mongoose.model("WorkItem",
    workItemSchema);