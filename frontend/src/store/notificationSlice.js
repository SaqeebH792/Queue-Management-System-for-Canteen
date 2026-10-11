import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../routes/notification.routes";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotifications();
      return Array.isArray(response.data) ? response.data : response || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const readNotification = createAsyncThunk(
  "notification/readNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await markNotificationAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

export const readAllNotifications = createAsyncThunk(
  "notification/readAllNotifications",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all notifications as read"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const exists = state.items.some(item => item._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    markNotificationReadLocally: (state, action) => {
      const notification = state.items.find(item => item._id === action.payload);
      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
      }
    },
    clearNotificationError: state => {
      state.error = null;
    },
    resetNotifications: state => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const unique = new Map();
        action.payload.forEach(item => unique.set(item._id, item));
        state.items = [...unique.values()].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(readNotification.fulfilled, (state, action) => {
        const item = state.items.find(n => n._id === action.payload);
        if (item) {
          item.isRead = true;
          item.readAt = new Date().toISOString();
        }
      })

      .addCase(readAllNotifications.fulfilled, state => {
        const now = new Date().toISOString();
        state.items.forEach(item => {
          item.isRead = true;
          item.readAt = now;
        });
      });
  },
});

export const {
  addNotification,
  markNotificationReadLocally,
  clearNotificationError,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
