export const App_API_Endpoints = {

    users: {
        registerUser: 'users/register',
        googleLogin:'users/google-login',
        
    },
    common:{
        getGoogle:'common/get-google-client',
        getWorkItems:'common/get-work-item',
        getDevelopmentStates:'common/get-development-state',
        saveWorkItem:'common/save-work-item',
        saveDevelopmentState:'common/save-development-state',
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
    }

}