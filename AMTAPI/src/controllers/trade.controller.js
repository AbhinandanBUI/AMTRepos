import { ApiResponse,ApiResponseMessage } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AddTask } from "../model/addTask.model.js";
import mongoose from "mongoose";


/// fetch records of all task created

const getTaskAsync = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const result = await AddTask.find({createdByUser:owner,isActive:true}).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, result, ApiResponseMessage.Records_Success, result.length));
});

/// saved task 
 
const saveTaskAsync = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { taskName,projectId,estimatedHours,priority,status,notes } = req.body;
  const result = await AddTask.create({
    taskName: taskName,
    projectId: projectId,
    estimatedHours: estimatedHours,
    priority: priority,
    status: status,
    notes: notes,
    createdByUser : owner
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, ApiResponseMessage.Record_Saved, 0));
});

const deleteTaskAsync = asyncHandler(async (req, res) => {
   const owner = req.user._id;
   const result = await AddTask.findByIdAndUpdate({_id: new mongoose.Types.ObjectId(req.query.id) },{
    isActive: false
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, ApiResponseMessage.Record_Delete, 0));
});
export { getTaskAsync, saveTaskAsync, deleteTaskAsync };
