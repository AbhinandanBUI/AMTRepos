import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Profile } from "../model/profile.model.js";
import { LoanAccount } from "../model/loanaccount.mode.js";
import { LoanTransation } from "../model/loantransation.model.js";
import mongoose from "mongoose";

import {
  getLocalPath,
  getMongoosePaginationOptions,
  getStaticFilePath,
  removeLocalFile,
} from "../utils/helpers.js";
import { User } from "../model/user.model.js";
import moment from "moment-timezone";

const getLoanUser = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.query;
  let userdetails = await Profile.find({ phoneNumber: phoneNumber }).select(
    "owner"
  );

  if (userdetails[0] != undefined) {
    if (userdetails[0].owner.toString() == req.user._id.toString()) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "You cannot create your self acccount", 0)
        );
    }
    const userProfile = await User.findById(
      new mongoose.Types.ObjectId(userdetails[0].owner)
    );

    userdetails = {
      name: userProfile.fullName,
      phoneNumber: phoneNumber,
      image: userProfile.avatar.url,
      userId: userProfile._id,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, userdetails, "User found", 0));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No record found", 0));
  }
});

const createLoanAccount = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const owner = req.user._id;
  const userExist = await LoanAccount.count({
    $and: [
      { $or: [{ userId: userId }, { owner: userId }] },
      { $or: [{ userId: owner }, { owner: owner }] },
    ],
  });
  if (userExist > 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Acccount already exist  ", "User found", 0));
  } else {
    const account = await LoanAccount.create({
      owner,
      userId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, account, "Account created successfully"));
  }
});

const getLoanAccount = asyncHandler(async (req, res) => {
  // const { userId } = req.body;
  const { page = 1, limit = 5 } = req.query;
  const userId = req.user._id;

  //  aggration  with pagination  getMongoosePaginationOptions

  const userExist = await LoanAccount.find({
    $and: [{ $or: [{ userId: userId }, { owner: userId }] },{isActive:true}],
  }).populate([
    { path: "owner", model: "User", select: "_id fullName email avatar" },
    { path: "userId", model: "User", select: "_id fullName email avatar" },
  ]);

  const modifiedResults = userExist.map((item) => {
    let modifiedItem = { ...item.toObject() };
    if (item.userId._id.toString() !== userId.toString()) {
      modifiedItem.loanername = item.userId;
      modifiedItem.userId = undefined;
    }

    if (item.owner._id.toString() !== userId.toString()) {
      modifiedItem.loanername = item.owner;
      modifiedItem.owner = undefined;
    }
    return modifiedItem;
  });

  if (userExist > 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Acccount already exist  ", "User found", 0));
  } else {
    modifiedResults.forEach((item) => {
      let send,
        receive = 0;
      if (item.userId !== undefined) {
        send = item.sendamount;
        receive = item.receiveamount;
        item.sendamount = receive;
        item.receiveamount = send;
      }
    });
    return res
      .status(201)
      .json(
        new ApiResponse(200, modifiedResults, "Account fetched successfully")
      );
  }
});

///////////// ---------- getTransation --------------- ////////////////

const getTransation = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5, Id } = req.query;
  const userId = req.user._id;
  const transAggregate = LoanTransation.aggregate([
    { $match: { loanAccountId: new mongoose.Types.ObjectId(Id) } },
    { $sort: { createdAt: -1 } },
  ]);
  const userName = await LoanAccount.findById(Id).populate([
    { path: "owner", model: "User", select: " fullName " },
    { path: "userId", model: "User", select: " fullName " },
  ]);

  const userPhoneNumber = await Profile.find({ owner: new mongoose.Types.ObjectId(userName.owner._id) },{phoneNumber:1});
  const loanerPhoneNumber = await Profile.find({
    owner: new mongoose.Types.ObjectId(userName.userId._id)
  },{phoneNumber:1});
   const userData = {
    accountName:userName.owner.fullName,
    loanerName:userName.userId.fullName,
    accountPhoneNumber:userPhoneNumber[0].phoneNumber,
    loanerPhoneNumber:loanerPhoneNumber[0].phoneNumber,
    accountFrom: moment(userName.createdAt).format('DD-MMM-yyyy'),
    accountTo:moment(userName.updatedAt).format('DD-MMM-yyyy')
  }
   const transAmount = await LoanTransation.aggregatePaginate(
    transAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalProducts",
        docs: "transAmount",
      },
    })
  );
  transAmount.transAmount.forEach((item) => {
    if (userId.equals(item.createdBy)) {
      if (item.transationType === 1) {
        item.transationType = 1;
      }
    } else {
      if (item.transationType === 1) {
        item.transationType = 2;
      }
    }
  });

  const response = {
    result: transAmount,
    userDetails: userData,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, response, "Transation fetched successfully"));
});

///////////// ----------   Get loan trans last weekly for notifications  --------------- ////////////////

const getAllTransationWeeks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const userId = req.user._id;
  const lastSeveDate = new Date();
  lastSeveDate.setDate(lastSeveDate.getDate() - 7);

  const loanTansDetails = await LoanTransation.find(
    {
      $or: [
        { createdTo: new mongoose.Types.ObjectId(userId) },
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { createdAt: lastSeveDate },
      ],
    },

    {
      amount: 1,
      createdAt: 1,
      createdBy: 1,
      createdTo: 1,
      transationType: 1,
      description: 1,
    }
  )
    .populate([
      { path: "createdTo", model: "User", select: " fullName avatar" },
      { path: "createdBy", model: "User", select: " fullName avatar" },
    ])
    .sort({ createdAt: -1 });
  loanTansDetails.forEach((item) => {
    if (userId.equals(item.createdBy._id)) {
      item.transationType = 1;
    } else {
      if (item.transationType === 1) {
        item.transationType = 2;
      }
    }
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, loanTansDetails, "Transation fetched successfully")
    );
});

const saveTransation = asyncHandler(async (req, res) => {
  const { Id, transationType, createdTo, amount, description, spayfrom } =
    req.body;
  const owner = req.user._id;
  const account = await LoanTransation.create({
    owner,
    loanAccountId: Id,
    createdBy: owner,
    createdTo: createdTo,
    amount,
    // depositedDate: new Date(),
    payFrom: spayfrom,
    transationType,
    description,
  });

  // /update the amount
  const getamount = await LoanAccount.findById(Id);
  const nwamount = await LoanTransation.find({
    loanAccountId: new mongoose.Types.ObjectId(Id),
  });
  let totalSendAmount = 0;
  let totalReceiveAmount = 0;
  let totalPaidAmount = 0;
  nwamount.forEach((item) => {
    if (owner.equals(item.createdBy)) {
      totalSendAmount += parseInt(item.amount);
    } else {
      totalReceiveAmount += parseInt(item.amount);
    }
  });

  totalPaidAmount = totalSendAmount - totalReceiveAmount;
  if (getamount) {
    const resdata = await LoanAccount.findOneAndUpdate(
      new mongoose.Types.ObjectId(Id),
      {
        $set: {
          transactionCount: getamount.transactionCount + 1,
          totalamount: totalSendAmount + totalReceiveAmount,
          sendamount: totalSendAmount,
          receiveamount: totalReceiveAmount,
          payamount: totalPaidAmount,
        },
      },
      { new: true }
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, account, "Amount saved  successfully"));
});

///////////// --------------  getTransation  ----------////////////////

export {
  getLoanUser,
  createLoanAccount,
  getLoanAccount,
  saveTransation,
  getTransation,
  getAllTransationWeeks,
};
