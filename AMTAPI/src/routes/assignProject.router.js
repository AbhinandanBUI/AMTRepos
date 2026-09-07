import { Router } from "express";
import {
    getAssignProjectAsync,saveAssignProjectAsync,deleteAssignProjectAsync
} from "../controllers/assignProject.controller.js";
import {
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/").get(getAssignProjectAsync);
router.route("/save").post(saveAssignProjectAsync);
router.route("/delete").delete(deleteAssignProjectAsync);
export default router;
