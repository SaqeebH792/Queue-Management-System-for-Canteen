import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

// Verify Student Authentication
export const verifyStudentAuth = createAsyncThunk(
  "studentAuth/verifyStudentAuth",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/users/verify", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Authentication failed" },
      );
    }
  },
);

// Student Logout
export const logoutStudent = createAsyncThunk(
  "studentAuth/logoutStudent",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/users/student/logout",
        {},
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Logout failed" },
      );
    }
  },
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    clearStudentAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearStudentErrors(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify Auth Handlers
      .addCase(verifyStudentAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyStudentAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user =
          action.payload?.data?.user || action.payload?.user || action.payload;
        state.error = null;
      })
      .addCase(verifyStudentAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })

      // Student Logout Handlers
      .addCase(logoutStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutStudent.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutStudent.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStudentAuth, clearStudentErrors } =
  studentAuthSlice.actions;

export default studentAuthSlice.reducer;
