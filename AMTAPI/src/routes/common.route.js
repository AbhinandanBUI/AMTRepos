import { Router } from "express";
import {
    getGoogleClientIdAsync
} from "../controllers/common.controller.js";
import {
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/get-google-client").get(getGoogleClientIdAsync);
export default router;
