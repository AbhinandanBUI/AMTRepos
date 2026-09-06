import { Router } from "express";
import {
    getAllUserLists
} from "../controllers/admin.controller.js";
import {
  verifyPermission,
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/userLists").get( verifyJWT,getAllUserLists);
export default router;
