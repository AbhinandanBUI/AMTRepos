import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
 import { User } from "../model/user.model.js";
import mongoose from "mongoose";

const getAllUserLists = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  const result = await User.aggregate([
    {
      $match: {
        role: "USER",
      },
    },
    {
      $lookup: {
        from: "profiles", // Specify the name of the other collection ('profiles' in this case)
        localField: "_id", // Field from the current collection ('users') to match on
        foreignField: "owner", // Field from the 'profiles' collection to match against
        as: "profile", // Name for the new field that will hold the matched profile document(s)
      },
    },
    {
      $addFields: {
        profile: { $arrayElemAt: ["$profile", 0] }, // Take the first matching profile (if any)
      },
    },
    {
      $project: {
        username: "$username",
        fullname: "$fullName",
        photo: "$avatar.url",
        emailexpiry: "$emailVerificationExpiry",
        email: "$email",
        role: "$role",
        isemailverified: {
          $cond: {
            if: "$isEmailVerified", // Condition based on the value of isEmailVerified
            then: "Yes", // Value if isEmailVerified is true
            else: "No", // Value if isEmailVerified is false
          },
        },
        isprofileupdate: {
          $cond: {
            if: "$isProfileUpdate", // Condition based on the value of isEmailVerified
            then: "Yes", // Value if isEmailVerified is true
            else: "No", // Value if isEmailVerified is false
          },
        },
        createdAt: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        updatedAt: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        membershipupto: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$profile.memberShipupto",
          },
        },
        phone: "$profile.phoneNumber",
        isUpdate: "$profile.isUpdated",
        dateofbirth: "$profile.dob",
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, result, "Users lists", 0));
});

export { getAllUserLists };
