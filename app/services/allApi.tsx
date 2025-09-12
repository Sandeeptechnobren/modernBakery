// app/services/allApi.ts
import axios from "axios";


const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL|| "https://api.coreexl.com/osa_productionV2/public/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async (credentials: { email: string; password: string }) => {
  const res = await API.post("/master/auth/login", credentials);
  return res.data;
};
