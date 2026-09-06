class ApiResponse {
  constructor(statusCode, data, message = "Success",totalrecords) {
    this.statusCode = statusCode;
    this.totalrecords = totalrecords,
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
  }
}

export { ApiResponse };


export const ApiResponseMessage = {
 Records_Success : 'Records fetch Successfully',
 Record_Saved : 'Record saved Successfully',
 Record_Delete : 'Record deleted Successfully',

}