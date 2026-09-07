import { isActive } from "@angular/router"

export interface saveAssignProject {
    projectId: {
        type: Number,
        required: true,
    },
    allocationHours: {
        type: Number,
        default: 0,
        required: true,
    },
    notes: {
        type: String,
        required: false,
    },
    startDate: {
        type: Date,
        required: false,
    },
    endDate: {
        type: Date,
        required: false,
    },
}
export interface AssignProjectList {
    _id: string,
    projectId: Number,
    allocationHours: Number,
    notes: string,
    startDate: string,
    endDate: string,
    isActive: boolean,
    createdByUser: string,
    createdAt: string,
    updatedAt: string,
    assignProjectId: Number,
}