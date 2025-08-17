import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'
import allUserReducer from "./allUser";



const appStore = configureStore({
    reducer:{
        user : userReducer,
         allUser: allUserReducer,
       
    },

})
export default appStore