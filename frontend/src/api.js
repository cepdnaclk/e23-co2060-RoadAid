import axios from "axios";
import { getAuth } from "./auth";

export const api = axios.create({
  baseURL: "https://athifnular7.pythonanywhere.com",
});

api.interceptors.request.use((config) => {
  const { token } = getAuth();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
