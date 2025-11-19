import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./APIutils";

export const purchaseOrderList = async (params?: Params) => {
  try {
    const res = await API.get("/api/hariss_transaction/po_orders/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const purchaseOrderById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/hariss_transaction/po_orders/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const purchaseOrderExportCollapse = async (params: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/exportcollapse`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const purchaseOrderExportHeader = async (params: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/exportheader`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};