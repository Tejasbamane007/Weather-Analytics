console.log('store.js: Configuring Redux store...');
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import weatherReducer from "./weatherSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    weather: weatherReducer,
  },
});
