import axios, { AxiosError } from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  try {
    const session = await fetchAuthSession();
    const token = session?.tokens?.accessToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // User not authenticated, continue without token
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      window.dispatchEvent(new Event("cloudnotes:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export const getApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.error || error.response?.data?.message || error.message || "Something went wrong";
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong";
};
