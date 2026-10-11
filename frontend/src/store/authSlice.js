import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

export const verifyAuth = createAsyncThunk("auth/verifyAuth", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/users/verify", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

export const logoutAction = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("users/admin/logout", {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Logout failed");
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(verifyAuth.pending, state => {
        state.loading = true;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(verifyAuth.rejected, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(logoutAction.pending, state => {
        state.loading = true;
      })
      .addCase(logoutAction.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(logoutAction.rejected, state => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
