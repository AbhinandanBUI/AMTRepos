import mongoose from "mongoose";
import { tproduct } from "../model/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
  getLocalPath,
  getMongoosePaginationOptions,
  getStaticFilePath,
  removeLocalFile,
} from "../utils/helpers.js";
import { MAXIMUM_SUB_IMAGE_COUNT } from "../constants.js";
import moment from "moment-timezone";
// import { Category } from "../../../models/apps/ecommerce/category.models.js";

const getAllProducts = asyncHandler(async (req, res) => {
  //product
  const { page = 1, limit = 5 } = req.query;
  const userId = req.user._id;
  // Get the start and end of the current day in UTC
  let today = new Date();
  let todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()-7,
    0,
    0,
    0,
    0
  );

  let todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    0
  );

  const productAggregate = tproduct.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        dop: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        payfor: "$productName_Id",
        amount: "$amount",
        payFrom: "$payFrom",
        productName_Id: "$productName_Id",
        createdAt: "$createdAt",
        // You can include other fields as needed or exclude them.
      },
    },
  ]);

  const products = await tproduct.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalProducts",
        docs: "products",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// ## Reporting product  ####///

const reportingProduct = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const userId = req.user._id;
  // Get the start and end of the current day in UTC

  const productAggregate = tproduct.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        payfor: "$productName_Id",
        amount: "$amount",
        payFrom: "$payFrom",
        productName_Id: "$productName_Id",
        createdAt: "$createdAt",
        // You can include other fields as needed or exclude them.
      },
    },
  ]);

  const products = await tproduct.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalProducts",
        docs: "products",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

/// reporting product by date
const reportingProductbydate = asyncHandler(async (req, res) => {
  const { page = 1, limit = 3000, fromdate, todate } = req.query;
  // console.log('data from ui',fromdate,todate);
  const userId = req.user._id;
  // Get the start and end of the current day in UTC
  let pfromdate = new Date(fromdate);
  let ptodate = new Date(todate);

  const productAggregate = tproduct.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        $and: [
          { createdAt: { $gte: pfromdate } },
          { createdAt: { $lte: ptodate } },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        payfor: "$productName_Id",
        amount: "$amount",
        payFrom: "$payFrom",
        productName_Id: "$productName_Id",
        createdAt: "$createdAt",
        // You can include other fields as needed or exclude them.
      },
    },
  ]);

  const products = await tproduct.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalProducts",
        docs: "products",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// ## Reporting product  ####///

// Getting the dashboard current data amount //

const dashboardPerdayamount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  ///// ///////////////////////////////////////////////// date filterss

  const mydate = new Date();
  // today
  let startToday = new Date().setHours(0, 0, 0, 0);
  let endToday = new Date().setHours(23, 59, 50, 0);
  startToday = new Date(startToday);
  endToday = new Date(endToday);
  // tomorrow
  let startTomorrow = new Date().setDate(mydate.getDate() - 1);
  let endTomorrow = new Date().setDate(mydate.getDate() - 1);
  startTomorrow = new Date(startTomorrow).setHours(0, 0, 0, 0);
  endTomorrow = new Date(endTomorrow).setHours(23, 59, 59, 0);
  startTomorrow = new Date(startTomorrow);
  endTomorrow = new Date(endTomorrow);

  // current month
  let startCurrentMonth = new Date(
    mydate.getFullYear(),
    mydate.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
  startCurrentMonth = new Date(startCurrentMonth);

  // last month
  let startLastMonth = new Date(
    mydate.getFullYear(),
    mydate.getMonth() - 1,
    1,
    0,
    0,
    0,
    0
  );
  let EndLastMonth = new Date(
    mydate.getFullYear(),
    mydate.getMonth() - 1,
    31,
    23,
    59,
    59,
    0
  );
  startLastMonth = new Date(startLastMonth);
  EndLastMonth = new Date(EndLastMonth);

  //current year
  let startCurrentYear = new Date(mydate.getFullYear(), 0, 1, 0, 0, 0, 0);
  startCurrentYear = new Date(startCurrentYear);
  //last year year

  let startLastYear = new Date(new Date().getFullYear() - 1, 0, 1, 0, 0, 0, 0);
  let EndLastYear = new Date(
    new Date().getFullYear() - 1,
    11,
    31,
    23,
    59,
    59,
    0
  );
  startLastYear = new Date(startLastYear);
  EndLastYear = new Date(EndLastYear);

  const result = await tproduct.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startLastYear, $lte: endToday },
      },
    },
    {
      $project: {
        _id: 0,
        createdAt: 1,
        amount: 1,
      },
    },
    {
      $group: {
        _id: null,
        todayAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startToday] },
                  { $lte: ["$createdAt", endToday] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        tomorrowAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startTomorrow] },
                  { $lte: ["$createdAt", endTomorrow] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        // current month
        currentMonthAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startCurrentMonth] },
                  { $lte: ["$createdAt", endToday] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        // last month
        lastMonthAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startLastMonth] },
                  { $lte: ["$createdAt", EndLastMonth] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        // current year
        currentYearAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startCurrentYear] },
                  { $lte: ["$createdAt", endToday] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        // last year
        lastYearAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startLastYear] },
                  { $lte: ["$createdAt", EndLastYear] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        // last year
        totalAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", startLastYear] },
                  { $lte: ["$createdAt", endToday] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
      },
    },
    // {
    //   $group: {
    //     _id: null,
    //     totalAmount: { $sum: "$amount" },
    //   },
    // },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Amounts fetched successfully"));
});

const dashboardWeeklyamount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentWeek = moment().subtract(0, "weeks").isoWeek();
  const prevWeek = moment().subtract(1, "weeks").isoWeek();
  const dateRangeOfWeeks = await tproduct.aggregate([
    {
      // Generate a range of numbers from 1 to 365 (for the entire year)
      $addFields: {
        daysToAdd: { $range: [1, 366] }, // We use 366 because the end value is exclusive (1 to 365)
      },
    },
    {
      // Project a new field for each day in the range
      $project: {
        dates: {
          $map: {
            input: "$daysToAdd",
            as: "day",
            in: {
              $toDate: {
                $add: [
                  new Date(new Date().getFullYear(), 0, 1),
                  { $multiply: ["$$day", 24 * 60 * 60 * 1000] },
                ],
              },
            },
          },
        },
      },
    },
    {
      // Unwind the dates array to get individual documents for each date
      $unwind: "$dates",
    },
    {
      // Project to rename the dates field and calculate weekNumber and weekDay
      $project: {
        _id: 0,
        date: "$dates",
        dateF: { $dateToString: { format: "%Y-%m-%d", date: "$dates" } },
        weekNumber: { $isoWeek: "$dates" }, // Calculate ISO week number
        weekDay: { $isoDayOfWeek: "$dates" }, // Calculate ISO day of the week
      },
    },
    {
      $match: {
        weekNumber: { $in: [prevWeek, currentWeek] },
      },
    },
    {
      $limit: 14,
    },
  ]);
  const result = await tproduct.aggregate([
    {
      // Project fields and calculate ISO week number of 'dop'
      $project: {
        user: "$owner",
        dop: "$dop",
        isoDate: "$dop",
        amount: "$amount",
        weekNumber: { $isoWeek: "$dop" }, // Calculate ISO week number of 'dop'
      },
    },
    {
      // Match documents where weekNumber is 13 or 14
      $match: {
        weekNumber: { $in: [prevWeek, currentWeek] }, // Filter for week numbers 13 and 14
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      // Group by formatted date and sum amounts
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$dop" } }, // Group by formatted date
        amount: { $sum: "$amount" },
      },
    },
    {
      // Project final fields including weekNumber and weekDayName
      $project: {
        _id: 0,
        date: "$_id", // Rename _id to isoDate
        amount: "$amount",
      },
    },
  ]);
  const weekDayName = [
    "Non",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
   let prevWeekData = [];
  let currentWeekData = [];

  dateRangeOfWeeks.forEach((item) => {
    const findingAmount = result.find((x) => x.date === item.dateF);
    let Adata = {};
    if (findingAmount) {
      Adata = {
        wDate: item.dateF,
        wWeekNumber: item.weekNumber,
        wWeekDay: weekDayName[item.weekDay],
        wAmount: findingAmount.amount,
      };
    } else {
      Adata = {
        wDate: item.dateF,
        wWeekNumber: item.weekNumber,
        wWeekDay: weekDayName[item.weekDay],
        wAmount: 0,
      };
    }
    if (Adata.wWeekNumber === currentWeek) {
      currentWeekData.push(Adata);
    } else {
      prevWeekData.push(Adata);
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {prevWeekData,currentWeekData},
        "Weekday amounts fetched successfully"
      )
    );
});

//yearly

const dashboardyearlyamount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const year = req.query.year;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const aggregateOptions = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: new Date(year, 0, 1), // January 1st of the current year
          $lte: new Date(year, 11, 31), // December 31st of the current year
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $arrayElemAt: [months, { $subtract: ["$_id", 1] }],
        },
        totalAmount: 1,
      },
    },
  ];

  const result = await tproduct.aggregate(aggregateOptions);

  // Create an object to store the sums by month
  const sumByMonth = {};
  result.forEach((item) => {
    sumByMonth[item.month] = item.totalAmount;
  });

  // Fill in months with no data with 0 sum
  months.forEach((month) => {
    if (!sumByMonth[month]) {
      sumByMonth[month] = 0;
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, [sumByMonth], "yearly amounts fetched successfully")
    );
});
//yearly

//End -- Getting the dashboard current data amount //
const createProduct = asyncHandler(async (req, res) => {
  const { payfor, amount, payfrom, createdAt } = req.body;
  let newdate = new Date(createdAt).setHours(5, 30, 0, 0);
  const owner = req.user._id;
  const product = await tproduct.create({
    owner,
    productName_Id: payfor,
    amount: amount,
    payFrom: payfrom,
    createdAt: new Date(newdate),
    dop: new Date(newdate),
  });
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const deleteResult = await tproduct.deleteMany({ owner });

  return res
    .status(201)
    .json(new ApiResponse(201, deleteResult, "Product deleted successfully"));
});

// product by payment gateway
const productPaymentGateway = asyncHandler(async (req,res)=>{
  // const owner = req.user._id;
  const result = await tproduct.aggregate([
    {
      $match: {
        // owner: ObjectId("652da3307769494c9e5a66eb"),
        dop: {
          $gte: new Date("2024-01-01"), // Match documents on or after January 1, 2024
          $lt: new Date("2025-01-01")   // Match documents before January 1, 2025
        }
       }
    },
    {
      $project: {
        paymentGateway: "$payFrom",
        date: "$dop",
        // month: { $month: "$dop" }, // Extract month from the 'dop' field
        Date: { $dateToString: { format: "%Y-%m", date: "$dop" } }
      }
    },
    {
      $group: {
        _id:{ paymentType:"$paymentGateway",month:"$Date" },  
        
         count: { $sum: "$paymentGateway" }     
      }
    },
    {
      $sort: {
       
        count:-1,
         _id: 1,
      }
    }
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Products by payments type"));
});


/// daily spend by perday data
/// daily spend by perday data
const dailyProductChart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const today = new Date();
  let startfrom = today;
  let endfrom = today;
  startfrom = new Date(
    today.getFullYear(),
    today.getMonth() ,
    1,
    0,
    0,
    0,
    0
  );
  endfrom = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
    23,
    0,
    0,
    0
  );
  const result = await tproduct.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startfrom,
          $lte: endfrom,
        },
      },
    },

    {
      $project: {
        _id: 0,
        createdAt: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        amount: 1,
      },
    },
    {
      $group: {
        _id: "$createdAt",
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 1,
        date: "$_id",
        amount: "$totalAmount",
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return res
    .status(201)
    .json(
      new ApiResponse(200, result, "Successfully get daily product amount")
    );
});

/// daily spend by perday data
/// daily spend by perday data

// const updateProduct = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const { name, description, category, price, stock } = req.body;

//   const product = await Product.findById(productId);

//   // Check the product existence
//   if (!product) {
//     throw new ApiError(404, "Product does not exist");
//   }

//   const mainImage = req.files?.mainImage?.length
//     ? {
//         // If user has uploaded new main image then we have to create an object with new url and local path in the project
//         url: getStaticFilePath(req, req.files?.mainImage[0]?.filename),
//         localPath: getLocalPath(req.files?.mainImage[0]?.filename),
//       }
//     : product.mainImage; // if there is no new main image uploaded we will stay with the old main image of the product

//   /**
//    * @type {{ url: string; localPath: string; }[]}
//    */
//   let subImages =
//     // If user has uploaded new sub images then we have to create an object with new url and local path in the array format
//     req.files?.subImages && req.files.subImages?.length
//       ? req.files.subImages.map((image) => {
//           const imageUrl = getStaticFilePath(req, image.filename);
//           const imageLocalPath = getLocalPath(image.filename);
//           return { url: imageUrl, localPath: imageLocalPath };
//         })
//       : []; // if there are no new sub images uploaded we want to keep an empty array

//   const existedSubImages = product.subImages.length; // total sub images already present in the project
//   const newSubImages = subImages.length; // Newly uploaded sub images
//   const totalSubImages = existedSubImages + newSubImages;

//   if (totalSubImages > MAXIMUM_SUB_IMAGE_COUNT) {
//     // We want user to only add at max 4 sub images
//     // If the existing sub images + new sub images count exceeds 4
//     // We want to throw an error

//     // Before throwing an error we need to do some cleanup

//     // remove the  newly uploaded sub images by multer as there is not updation happening
//     subImages?.map((img) => removeLocalFile(img.localPath));
//     if (product.mainImage.url !== mainImage.url) {
//       // If use has uploaded new main image remove the newly uploaded main image as there is no updation happening
//       removeLocalFile(mainImage.localPath);
//     }
//     throw new ApiError(
//       400,
//       "Maximum " +
//         MAXIMUM_SUB_IMAGE_COUNT +
//         " sub images are allowed for a product. There are already " +
//         existedSubImages +
//         " sub images attached to the product."
//     );
//   }

//   // If above checks are passed. We need to merge the existing sub images and newly uploaded sub images
//   subImages = [...product.subImages, ...subImages];

//   const updatedProduct = await Product.findByIdAndUpdate(
//     productId,
//     {
//       $set: {
//         name,
//         description,
//         stock,
//         price,
//         category,
//         mainImage,
//         subImages,
//       },
//     },
//     {
//       new: true,
//     }
//   );

//   // Once the product is updated. Do some cleanup
//   if (product.mainImage.url !== mainImage.url) {
//     // If user is uploading new main image remove the previous one because we don't need that anymore
//     removeLocalFile(product.mainImage.localPath);
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
// });

// const getProductById = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const product = await Product.findById(productId);

//   if (!product) {
//     throw new ApiError(404, "Product does not exist");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, product, "Product fetched successfully"));
// });

// const getProductsByCategory = asyncHandler(async (req, res) => {
//   const { categoryId } = req.params;
//   const { page = 1, limit = 10 } = req.query;

//   const category = await Category.findById(categoryId).select("name _id");

//   if (!category) {
//     throw new ApiError(404, "Category does not exist");
//   }

//   const productAggregate = Product.aggregate([
//     {
//       // match the products with provided category
//       $match: {
//         category: new mongoose.Types.ObjectId(categoryId),
//       },
//     },
//   ]);

//   const products = await Product.aggregatePaginate(
//     productAggregate,
//     getMongoosePaginationOptions({
//       page,
//       limit,
//       customLabels: {
//         totalDocs: "totalProducts",
//         docs: "products",
//       },
//     })
//   );

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         { ...products, category },
//         "Category products fetched successfully"
//       )
//     );
// });

// const removeProductSubImage = asyncHandler(async (req, res) => {
//   const { productId, subImageId } = req.params;

//   const product = await Product.findById(productId);

//   // check for product existence
//   if (!product) {
//     throw new ApiError(404, "Product does not exist");
//   }

//   const updatedProduct = await Product.findByIdAndUpdate(
//     productId,
//     {
//       $pull: {
//         // pull an item from subImages with _id equals to subImageId
//         subImages: {
//           _id: new mongoose.Types.ObjectId(subImageId),
//         },
//       },
//     },
//     { new: true }
//   );

//   // retrieve the file object which is being removed
//   const removedSubImage = product.subImages?.find((image) => {
//     return image._id.toString() === subImageId;
//   });

//   if (removedSubImage) {
//     // remove the file from file system as well
//     removeLocalFile(removedSubImage.localPath);
//   }

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, updatedProduct, "Sub image removed successfully")
//     );
// });

// const deleteProduct = asyncHandler(async (req, res) => {
//   const { productId } = req.params;

//   const product = await Product.findOneAndDelete({
//     _id: productId,
//   });

//   if (!product) {
//     throw new ApiError(404, "Product does not exist");
//   }

//   const productImages = [product.mainImage, ...product.subImages];

//   productImages.map((image) => {
//     // remove images associated with the product that is being deleted
//     removeLocalFile(image.localPath);
//   });

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         { deletedProduct: product },
//         "Product deleted successfully"
//       )
//     );
// });

export {
  createProduct,
  // deleteProduct,
  getAllProducts,
  dashboardPerdayamount,
  dashboardWeeklyamount,
  dashboardyearlyamount,
  reportingProduct,
  dailyProductChart,
  deleteProduct,
  reportingProductbydate,
  productPaymentGateway
  // getProductById,
  // getProductsByCategory,
  // updateProduct,
  // removeProductSubImage,
};
