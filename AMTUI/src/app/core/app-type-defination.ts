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