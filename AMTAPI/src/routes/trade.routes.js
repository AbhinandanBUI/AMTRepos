import { Router } from "express";
import {
   getTrades,saveTrades,dashboardDaily
} from "../controllers/trade.controller.js";
import {
  verifyPermission,
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/").get( verifyJWT,getTrades);
router.route("/dashboard-daily").get( verifyJWT,dashboardDaily);
router.route("/").post( verifyJWT,saveTrades);
export default router;
