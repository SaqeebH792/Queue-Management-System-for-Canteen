import { createSlice } from "@reduxjs/toolkit";
const initialState = { notifications: [], unreadCount: 0 };
const notificationSlice = createSlice({ name: "notifications", initialState, reducers: {
  setNotifications: (state, action) => { state.notifications = action.payload || []; state.unreadCount = (action.payload || []).filter(n => !n.isRead).length; },
  addNotification: (state, action) => { state.notifications.unshift(action.payload); state.unreadCount += 1; },
  markAllRead: (state) => { state.notifications.forEach(n => { n.isRead = true; }); state.unreadCount = 0; },
  clearNotifications: (state) => { state.notifications = []; state.unreadCount = 0; },
}});
export const { setNotifications, addNotification, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
