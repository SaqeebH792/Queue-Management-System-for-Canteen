import { createSlice } from "@reduxjs/toolkit";

const savedAdmin = localStorage.getItem("superAdmin");
const savedToken = localStorage.getItem("accessToken");
const initialState = { superAdmin: savedAdmin ? JSON.parse(savedAdmin) : null, accessToken: savedToken || null, isAuthenticated: Boolean(savedToken) };

const authSlice = createSlice({ name: "auth", initialState, reducers: {
  loginSuccess: (state, action) => { const { superAdmin, accessToken } = action.payload; state.superAdmin = superAdmin; state.accessToken = accessToken; state.isAuthenticated = true; localStorage.setItem("superAdmin", JSON.stringify(superAdmin)); if (accessToken) localStorage.setItem("accessToken", accessToken); },
  logout: (state) => { state.superAdmin = null; state.accessToken = null; state.isAuthenticated = false; localStorage.removeItem("superAdmin"); localStorage.removeItem("accessToken"); },
}});
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
