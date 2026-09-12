import { Router } from "express";
import {
    getTaskAsync,saveTaskAsync,deleteTaskAsync
} from "../controllers/addTask.controller.js";
import {
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/").get(verifyJWT,getTaskAsync);
router.route("/save").post(verifyJWT,saveTaskAsync);
router.route("/delete").delete(verifyJWT,deleteTaskAsync);
export default router;
