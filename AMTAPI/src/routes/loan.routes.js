import { Router } from "express";
import {
  getLoanUser,createLoanAccount,getLoanAccount,getTransation, saveTransation,getAllTransationWeeks
} from "../controllers/loan.controller.js";
import {
  verifyPermission,
  verifyJWT,
} from "../middlewares/auth.middlewares.js";
import { validate } from "../validators/validate.js";
import { MAXIMUM_SUB_IMAGE_COUNT, UserRolesEnum } from "../constants.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validators.js";

const router = Router();
router.route("/bynumber").get( verifyJWT,getLoanUser);
router.route("/get-account").get( verifyJWT,getLoanAccount);
router.route("/create-account").post(verifyJWT,createLoanAccount);
///------------------ --------------  creating routes for transation --------
router.route("/trans/").get(verifyJWT,getTransation);
router.route("/transLastWeekly/").get(verifyJWT,getAllTransationWeeks);
router.route("/trans/").post(verifyJWT,saveTransation);
// hello my name is 

///------------------ --------------  creating routes for transation --------

// router
//   .route("/")
//   .get( verifyJWT,getLoanUser);
// //   .post(
// //     verifyJWT,
// //     verifyPermission([UserRolesEnum.USER]),
// //     // // In product form we will received one main image file type
// //     // // And max 4 sub images
// //     // upload.fields([
// //     //   {
// //     //     name: "mainImage",
// //     //     maxCount: 1,
// //     //   },
// //     //   {
// //     //     // frontend will send at max 4 `subImages` keys with file object which we will save in the backend
// //     //     name: "subImages",
// //     //     maxCount: MAXIMUM_SUB_IMAGE_COUNT, // maximum number of subImages is 4
// //     //   },
// //     // ]),
// //     // createProductValidator(),
// //     validate,
// //     createProduct
// //   );
//   // router
//   // .route("/:productId")
//   // .get(mongoIdPathVariableValidator("productId"), validate, getProductById)
   

export default router;
