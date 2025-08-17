import { createSlice } from "@reduxjs/toolkit";

const allUser = createSlice({
  name: "allUser",
  initialState: null,
  reducers: {
    addAllUser: (state, action) => {
      state.addAllUser = action.payload
    },
    makeGroup:(state , action) =>{
      state.makeGroup = action.payload
    }
  },
});

export const { addAllUser , makeGroup } = allUser.actions;
export default allUser.reducer;
