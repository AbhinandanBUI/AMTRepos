import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Counter } from "./counter.model.js";

const addTaskSchema = new Schema(
    {
        taskId: {
            type: Number,
            unique: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        taskName: {
            type: String,
            required: true,
        },

        projectId: {
            type: Number,
            required: true,
        },

        estimatedHours: {
            type: Number,
            default: 0,
            required: true,
        },

        priority: {
            type: Number,
            default: 0,
            required: true,
        },

        status: {
            type: Number,
            default: 0,
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

addTaskSchema.pre("save", async function (next) {

    if (!this.isNew) {
        return next();
    }

    const counter = await Counter.findOneAndUpdate(
        { _id: "taskId" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true,
        }
    );

    this.taskId = counter.seq;

    next();
});

addTaskSchema.plugin(mongooseAggregatePaginate);

export const AddTask = mongoose.model("AddTask", addTaskSchema);