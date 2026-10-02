import { ApiResponse, ApiResponseMessage } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { WorkItem } from '../../model/masterData/workItem.model.js';
import { DevelopmentState } from '../../model/masterData/developmentStates.model.js';
import { New_Work_Items, Work_Item_States } from "./master-data.js";
import { ApiError } from "../../utils/ApiError.js";

/// fetch records of all task created

const getWorkItemsAsync = asyncHandler(async (req, res) => {

    const result = await WorkItem.find({ isActive: true })
        .select({ workItemId: 1, name: 1,colorCode: 1 ,isActive: 1 })
        .sort({ name: 1 });
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Records_Success, result.length));
});
const getDevelopmentStateAsync = asyncHandler(async (req, res) => {

    const result = await DevelopmentState.find({ isActive: true })
        .select({ _id: 1, name: 1, orderBy: 1, isActive: 1 })
        .sort({ orderBy: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Records_Success, result.length));
});

const createWorkItemAsync = asyncHandler(async (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const colorCode = typeof req.body.colorCode === "string" ? req.body.colorCode : "";
    if (!name || name.length > 60) throw new ApiError(400, "Work item name is required and must be 60 characters or fewer");
    if (!/^#[\da-f]{6}$/i.test(colorCode)) throw new ApiError(400, "Choose a valid six-digit hex color");

    const existing = await WorkItem.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
    if (existing) throw new ApiError(409, "A work item type with this name already exists");

    const workItem = await WorkItem.create({ name, colorCode, createdByUser: req.user._id });
    return res.status(201).json(new ApiResponse(201, workItem, ApiResponseMessage.Record_Saved, 1));
});

const createDevelopmentStateAsync = asyncHandler(async (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const colorCode = typeof req.body.colorCode === "string" ? req.body.colorCode : "";
    const orderBy = Number(req.body.orderBy);
    if (!name || name.length > 60) throw new ApiError(400, "State name is required and must be 60 characters or fewer");
    if (!/^#[\da-f]{6}$/i.test(colorCode)) throw new ApiError(400, "Choose a valid six-digit hex color");
    if (!Number.isInteger(orderBy) || orderBy < 0) throw new ApiError(400, "State order must be a non-negative whole number");

    const existing = await DevelopmentState.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
    if (existing) throw new ApiError(409, "A development state with this name already exists");

    const state = await DevelopmentState.create({ name, colorCode, orderBy, createdByUser: req.user._id });
    return res.status(201).json(new ApiResponse(201, state, ApiResponseMessage.Record_Saved, 1));
});

/// saved task 

const saveWorkItemAsync = asyncHandler(async (req, res) => {
    const owner = req.user._id;
    const workItems = New_Work_Items.map(item => ({
        name: item.Name,
        workItemId: New_Work_Items.indexOf(item) + 1,
        createdByUser: owner,
        colorCode: item.ColorCode
    }));
    const result = await WorkItem.insertMany(workItems);
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Record_Saved, 0));
});
const saveDevelopmentStateAsync = asyncHandler(async (req, res) => {
    const owner = req.user._id;
    const workItems = Work_Item_States.map(item => ({
        name: item.Name,
        orderBy: item.OrderBy,
        developmentStateId: Work_Item_States.indexOf(item) + 1,
        colorCode: item.ColorCode,
        createdByUser: owner
    }));
    const result = await DevelopmentState.insertMany(workItems);
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Record_Saved, 0));
});


export {
    createDevelopmentStateAsync,
    createWorkItemAsync,
    getWorkItemsAsync,
    saveDevelopmentStateAsync,
    saveWorkItemAsync,
    getDevelopmentStateAsync,
};
