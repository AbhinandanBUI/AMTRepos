import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const profileSchema = new Schema(
  {
    coverImage: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb2cBmQEJFT3sW4ZvyVjIEJXTfYEJwB56ngw&usqp=CAU`,
        localPath: "",
      },
    },
    bio: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: function () {
        // Calculate the date for one year from today
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() - 20);
        return oneYearFromNow;
      },
    },
    phoneNumber: {
      type: String,
      default: "9999999999",
      // unique: true,
      // lowercase: true,
      trim: true,
      // index: true,
      
    },
    memberShipupto: {
      type: Date,
      default: function () {
        // Calculate the date for one year from today
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return oneYearFromNow;
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isUpdated:{
      type:Boolean,
      default:false,
    }
  },
  { timestamps: true }
);

export const Profile = mongoose.model("Profile", profileSchema);
