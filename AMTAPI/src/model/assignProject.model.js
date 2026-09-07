import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Counter } from "./counter.model.js";

const assignProjectSchema = new Schema(
    {
        assignProjectId: {
            type: Number,
            unique: true,
        },
        projectId: {
            type: Number,
            required: true,
        },
        allocationHours: {
            type: Number,
            default: 0,
            required: true,
        },
        notes: {
            type: String,
            required: false,
        },
        startDate: {
            type: Date,
            required: false,
        },
        endDate: {
            type: Date,
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

assignProjectSchema.pre("save", async function (next) {

    if (!this.isNew) {
        return next();
    }

    const counter = await Counter.findOneAndUpdate(
        { _id: "assignProjectId" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true,
        }
    );

    this.assignProjectId = counter.seq;

    next();
});

assignProjectSchema.plugin(mongooseAggregatePaginate);

export const AssignProject = mongoose.model("AssignProject", assignProjectSchema);