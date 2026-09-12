import { ApiResponse,ApiResponseMessage } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AssignProject } from "../model/assignProject.model.js";
import mongoose from "mongoose";


/// fetch records of all task created

const getAssignProjectAsync = asyncHandler(async (req, res) => {
  // const owner = req.user._id;
  const result = await AssignProject.find({isActive:true}).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, result, ApiResponseMessage.Records_Success, result.length));
});

/// saved task 
 
const saveAssignProjectAsync = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { projectId,allocationHours,notes,startDate,endDate } = req.body;
  const result = await AssignProject.create({
    projectId: projectId,
    allocationHours: allocationHours,
    notes: notes,
    createdByUser : owner,
    startDate:startDate,
    endDate:endDate
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, ApiResponseMessage.Record_Saved, 0));
});

const deleteAssignProjectAsync = asyncHandler(async (req, res) => {
  // const owner = req.user._id;
  console.log('req.query.id', req.query.id);
  const result = await AssignProject.findByIdAndUpdate({_id: new mongoose.Types.ObjectId(req.query.id) },{
    isActive: false
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, ApiResponseMessage.Record_Delete, 0));
});
export { getAssignProjectAsync,saveAssignProjectAsync,deleteAssignProjectAsync };
