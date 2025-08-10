import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:null,
    reducers:{
        addUser :  (state , action) =>{
            return action.payload
        },
         clearUser: () => null,
     
    }

})

export const {addUser,clearUser } = userSlice.actions

export default userSlice.reducer