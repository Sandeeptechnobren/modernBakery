import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./APIutils";


export const pointsList = async (params?: Params) => {
  try {
    const res = await API.get("/api/loyality_management/loyalitypoint/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createCustomerLoyaltyPoints = async (payload: object) => {
  try {
    const res = await API.post("/api/settings/bonus/create", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerPointsDetails = async (uuid: string) => {
  try {
    const res = await API.get(`/api/loyality_management/loyalitypoint/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateBonus = async (uuid: string,body:object) => {
  try {
    const res =  await API.put(`/api/settings/bonus/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const adjustmentList = async (params?: Params) => {
  try {
    const res = await API.get("/api/loyality_management/adjustments/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createAdjustment = async (payload: object) => {
  try {
    const res = await API.post("/api/loyality_management/adjustments/create", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerClosingPoints = async (body?: object) => {
  try {
    const res = await API.post(`/api/loyality_management/loyalitypoint/getclosing`,body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// export const updateBonus = async (uuid: string,body:object) => {
//   try {
//     const res =  await API.put(`/api/settings/bonus/update/${uuid}`, body);
//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };