import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import studentAuthReducer from "./studentAuthSlice";
import orderReducer from "./orderSlice";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    studentAuth: studentAuthReducer,
    orders: orderReducer,
    notification: notificationReducer,
  },
});
