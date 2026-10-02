export const App_API_Endpoints = {

    users: {
        registerUser: 'users/register',
        login: 'users/login',
        createTestUser: 'users/test-users',
        googleLogin:'users/google-login',
        
    },
    common:{
        getGoogle:'common/get-google-client',
        getWorkItems:'common/get-work-item',
        getDevelopmentStates:'common/get-development-state',
        saveWorkItem:'common/save-work-item',
        saveDevelopmentState:'common/save-development-state',
        createWorkItem:'common/create-work-item',
        createDevelopmentState:'common/create-development-state',
    },

    taskAPI: {
        saveTask: 'addTask/save',
        getTask: 'addTask',
        deleteTask: 'addTask/delete',
    },
    assignProject: {
        save: 'assignProject/save',
        get: 'assignProject',
        delete: 'assignProject/delete',
    },
    agile: {
        projects: 'agile/projects',
        users: 'agile/users',
        projectMembers: (projectId: string) => `agile/projects/${projectId}/members`,
        projectSprints: (projectId: string) => `agile/projects/${projectId}/sprints`,
        projectIssues: (projectId: string) => `agile/projects/${projectId}/issues`,
        projectAnalytics: (projectId: string) => `agile/projects/${projectId}/analytics`,
        startSprint: (sprintId: string) => `agile/sprints/${sprintId}/start`,
        completeSprint: (sprintId: string) => `agile/sprints/${sprintId}/complete`,
        issueStatus: (issueId: string) => `agile/issues/${issueId}/status`,
        issueSprint: (issueId: string) => `agile/issues/${issueId}/sprint`,
        issueAssignee: (issueId: string) => `agile/issues/${issueId}/assignee`,
    },

}