export const App_API_Endpoints = {

    users: {
        registerUser: 'users/register',
        googleLogin:'users/google-login',
    },
    common:{
        getGoogle:'common/get-google-client'
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