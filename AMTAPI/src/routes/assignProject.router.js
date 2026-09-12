import { Router } from "express";
import {
    getAssignProjectAsync,saveAssignProjectAsync,deleteAssignProjectAsync
} from "../controllers/assignProject.controller.js";
import {
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/").get(verifyJWT,getAssignProjectAsync);
router.route("/save").post(verifyJWT,saveAssignProjectAsync);
router.route("/delete").delete(verifyJWT,deleteAssignProjectAsync);
export default router;
