import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("users/myOrders", {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to fetch orders" },
      );
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "/cancelOrder",
  async (orderId, thunkAPI) => {
    try {
      const response = await axiosInstance.patch(
        `/users/cancelOrder/${orderId}`,
        {},
        {
          withCredentials: true,
        },
      );

      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to cancel order" },
      );
    }
  },
);

const initialState = {
  orders: [],
  loading: true,
  updatingOrderId: null,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderErrors(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders Handlers
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Order Handlers
      .addCase(cancelOrder.pending, (state, action) => {
        state.updatingOrderId = action.meta.arg;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.updatingOrderId = null;
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );

        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.updatingOrderId = null;
        state.error = action.payload;
      });
  },
});

export const { clearOrderErrors } = orderSlice.actions;

export default orderSlice.reducer;
