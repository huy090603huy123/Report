import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visitorCount: '...',
  onlineCount: '...',
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setVisitorCount: (state, action) => {
      state.visitorCount = action.payload;
    },
    setOnlineCount: (state, action) => {
      state.onlineCount = action.payload;
    },
  },
});

export const { setVisitorCount, setOnlineCount } = analyticsSlice.actions;
export default analyticsSlice.reducer;