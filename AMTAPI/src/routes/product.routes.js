import { Router } from "express";
import {
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
  // removeProductSubImage,
  // updateProduct,
} from "../controllers/product.controllers.js";
import {
  verifyPermission,
  verifyJWT,
} from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
// import {
//   createProductValidator,
//   updateProductValidator,
// } from "../../../validators/apps/ecommerce/product.validators.js";
import { validate } from "../validators/validate.js";
import { MAXIMUM_SUB_IMAGE_COUNT, UserRolesEnum } from "../constants.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validators.js";

const router = Router();

router
  .route("/")
  .get( verifyJWT,getAllProducts)
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.USER]),
    // // In product form we will received one main image file type
    // // And max 4 sub images
    // upload.fields([
    //   {
    //     name: "mainImage",
    //     maxCount: 1,
    //   },
    //   {
    //     // frontend will send at max 4 `subImages` keys with file object which we will save in the backend
    //     name: "subImages",
    //     maxCount: MAXIMUM_SUB_IMAGE_COUNT, // maximum number of subImages is 4
    //   },
    // ]),
    // createProductValidator(),
    validate,
    createProduct
  );
  router.get('/reporting-product',verifyJWT,reportingProduct);
  router.get('/reporting-product-bydate',verifyJWT,reportingProductbydate);
  router.get('/dashboard-amount',verifyJWT,dashboardPerdayamount);
  router.get('/dashboard-weekly',verifyJWT,dashboardWeeklyamount);
  router.get('/dashboard-yearly',verifyJWT,dashboardyearlyamount);
  router.get('/dashboard-daily',verifyJWT,dailyProductChart);
  router.get('/delete-product',verifyJWT,deleteProduct);
  router.get('/product-paymentGateway',productPaymentGateway);
  // router
  // .route("/:productId")
  // .get(mongoIdPathVariableValidator("productId"), validate, getProductById)
   

export default router;
