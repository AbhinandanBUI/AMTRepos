import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Trade } from "../model/trade.model.js";
import mongoose from "mongoose";

const getTrades = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  const result = await Trade.find({ owner }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Trade records fetch", 0));
});
const dashboardDaily = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await Trade.aggregate(
   [ {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        sellAmount: "$sellAmount",
        buyAmount: "$buyAmount",
        quantity: "$quantity",
      },
    }]
    // [
    //   {
    //     $match: {
    //       owner: new mongoose.Types.ObjectId(userId),
    //     },
    //   },
    //   {
    //     $project: {

    //       date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
    //       dateG:"$date",
    //       sellAmount: "$sellAmount",
    //       buyAmount: "$buyAmount",
    //       quantity: "$quantity",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id:  { $dateToString: { format: "%Y-%m-%d", date: "$dateG" } },
    //       // Group by formatted date
    //       buyAmount: {
    //         $sum: "$buyAmount",
    //       },
    //       sellAmount: {
    //         $sum: "$sellAmount",
    //       },
    //       quantity: {
    //         $sum: "$quantity",
    //       },
    //     },
    //   },
    //   {
    //     $sort: {
    //       _id: -1,
    //     },
    //   },
    // ]
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Dashboard trade data fetch", 0));
});
const saveTrades = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { quantity, buyamount, sellamount, date, tradesector } = req.body;
  let newdate = new Date(date).setHours(5, 30, 0, 0);

  const result = await Trade.create({
    owner: owner,
    tradeSector: tradesector,
    quantity,
    buyAmount: buyamount,
    sellAmount: sellamount,
    date: new Date(newdate),
    createdAt: new Date(newdate),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Request logged", 0));
});

export { getTrades, saveTrades, dashboardDaily };
