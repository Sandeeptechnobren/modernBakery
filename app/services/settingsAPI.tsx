import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./APIutils";

export const getBrand = async (params: Params) => {
  try {
    const res = await API.get("/api/settings/brands/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};