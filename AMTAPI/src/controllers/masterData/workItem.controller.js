import { ApiResponse, ApiResponseMessage } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { WorkItem } from '../../model/masterData/workItem.model.js';
import { DevelopmentState } from '../../model/masterData/developmentStates.model.js';
import { New_Work_Items ,Work_Item_States} from "./master-data.js";

/// fetch records of all task created

const getWorkItemsAsync = asyncHandler(async (req, res) => {
    
    const result = await WorkItem.find({isActive: true }).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Records_Success, result.length));
});
const getDevelopmentStateAsync = asyncHandler(async (req, res) => {
    
    const result = await DevelopmentState.find({isActive: true }).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Records_Success, result.length));
});

/// saved task 

const saveWorkItemAsync = asyncHandler(async (req, res) => {
    const owner = req.user._id;
    const workItems = New_Work_Items.map(item => ({
        name: item.Name,
        createdByUser: owner
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
        orderBy:item.OrderBy,
        createdByUser: owner
    }));
    const result = await DevelopmentState.insertMany(workItems);
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Record_Saved, 0));
});


export { getWorkItemsAsync, saveDevelopmentStateAsync, saveWorkItemAsync, getDevelopmentStateAsync };
