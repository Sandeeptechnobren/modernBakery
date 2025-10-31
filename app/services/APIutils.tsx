import axios from "axios";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function handleError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    console?.error("API Error:", error?.response.data);
    return { error: true, data: error.response.data };
  } else if (error instanceof Error) {
    console.error("Request Error:", error.message);
    return { error: true, data: { message: error.message } };
  } else {
    console.error("An unknown error occurred.");
    return { error: true, data: { message: "An unknown error occurred." } };
  }
}