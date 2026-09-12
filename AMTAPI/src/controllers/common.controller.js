import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse,ApiResponseMessage } from "../utils/ApiResponse.js";


/// fetch records of all task created


const getGoogleClientIdAsync = asyncHandler(async (req, res) => {
    
  const result = await Promise.resolve( process.env.GOOGLE_CLIENT_ID );
   
    return res
        .status(200)
        .json(new ApiResponse(200, result, ApiResponseMessage.Records_Success, result.length));
});
export { getGoogleClientIdAsync };
