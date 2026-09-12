import mongoose, { Schema } from "mongoose";
import { Counter } from "../counter.model.js";

const developmentStateSchema = new Schema(
    {
        developmentStateId: {
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
        orderBy: {
            type: Number,
            default: 0,
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

developmentStateSchema.pre("save", async function (next) {
    if (!this.isNew) {
        return next();
    }
    const counter = await Counter.findOneAndUpdate(
        { _id: "developmentStateId" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true,
        }
    );
    this.developmentStateId = counter.seq;
    next();
});


export const DevelopmentState = mongoose.model("DevelopmentState",
    developmentStateSchema);