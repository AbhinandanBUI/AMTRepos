import { Router } from "express";
import {
    getTaskAsync,saveTaskAsync,deleteTaskAsync
} from "../controllers/addTask.controller.js";
import {
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/").get(getTaskAsync);
router.route("/save").post(saveTaskAsync);
router.route("/delete").delete(deleteTaskAsync);
export default router;
