export interface Id_Name_Type {
  Id: number;
  Name: string;
}

export interface TimeTask {
  _id: string;
  Id: number;
  Name: string;
  Project: ProjectAssignment;
  Estimate: number;
  Priority: Id_Name_Type;
  Status: Id_Name_Type;
  Notes: string;
  CreatedAt: Date;
}


export interface ProjectAssignment {
  _id: string;
  Id: number;
  ProjectName: string;
  Allocation: number;
  StartDate: string;
  EndDate: string;
  Notes: string;
}

export interface AppData {
  taskList: TimeTask[];
  projectList: ProjectAssignment[];
}

export interface AppDataResponse {
  taskList: TimeTask[];
}

//  removing the projectList from AppDataResponse as it is not needed in the response.

export interface APIResponse {
  statusCode: number,
  totalrecords: number,
  message: string,
  success: boolean,
  data: any
}
export interface UserProfile {
  email: string,
  id: string,
  name: string,
  profileUrl: string
}