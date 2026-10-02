import { Router } from "express";
import {
    getGoogleClientIdAsync
} from "../controllers/common.controller.js";
 
import {
      createDevelopmentStateAsync, createWorkItemAsync, getWorkItemsAsync, saveDevelopmentStateAsync, saveWorkItemAsync, getDevelopmentStateAsync
} from "../controllers/masterData/workItem.controller.js";
 
import {
  verifyJWT,
} from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/get-google-client").get(getGoogleClientIdAsync);
router.route("/get-development-state").get(getDevelopmentStateAsync);
router.route("/get-work-item").get(getWorkItemsAsync);
router.route("/create-work-item").post(verifyJWT, createWorkItemAsync);
router.route("/create-development-state").post(verifyJWT, createDevelopmentStateAsync);
router.route("/save-work-item").post(verifyJWT, saveWorkItemAsync);
router.route("/save-development-state").post(verifyJWT, saveDevelopmentStateAsync);
export default router;
