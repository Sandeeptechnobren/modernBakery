import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./allApi";

export const exportServiceTypes = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/service-types/export", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const serviceTypesList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/service-types/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getServiceTypesByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/settings/service-types/show/${uuid}`, {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const serviceTypesGenerateCode = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/service-types/generate-code", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type serviceTypes = {
  name: string;
  status: number;
};

export const addServiceTypes = async (body: serviceTypes) => {
  try {
    const res = await API.post("/api/settings/service-types/add", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateServiceTypes = async (uuid: string, body: serviceTypes) => {
  try {
    const res = await API.put(
      `/api/settings/service-types/update/${uuid}`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteServiceTypes = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/settings/service-types/delete/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Chiller
export const chillerList = async (params?: Params) => {
  try {
    const res = await API.get("/api/assets/chiller/list_chillers", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const chillerByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/assets/chiller/${uuid}`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const chillerGenerateCode = async (params?: Params) => {
  try {
    const res = await API.get(`/api/assets/chiller/generate-code`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type chiller = {
  serial_number: string;
  asset_number: string;
  model_number: string;
  description: string;
  acquisition: string;
  vender_details: string[];
  manufacturer: string;
  country_id: number;
  type_name: string;
  sap_code: string;
  status: number;
  is_assign: number;
  customer_id: number;
  agreement_id: number;
  document_type: string;
  document_id: number;
};

export const addChiller = async (body: chiller) => {
  try {
    const res = await API.post(`/api/assets/chiller/add_chiller`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const updateChiller = async (uuid: string, body: chiller) => {
  try {
    const res = await API.put(`/api/assets/chiller/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteChiller = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/assets/chiller/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// vendor
export const vendorList = async (params?: Params) => {
  try {
    const res = await API.get("/api/assets/vendor/list_vendors", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const vendorByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/assets/vendor/vendor/${uuid}`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const vendorGenerateCode = async (params?: Params) => {
  try {
    const res = await API.get(`/api/assets/vendor/generate-code`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type vendor = {
  name: string;
  address: string;
  contact: string;
  email: string;
  status: number;
};

export const addVendor = async (body: vendor) => {
  try {
    const res = await API.post(`/api/assets/vendor/add_vendor`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateVendor = async (uuid: string, body: vendor) => {
  try {
    const res = await API.put(`/api/assets/vendor/update_vendor/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteVendor = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/assets/vendor/delete_vendor/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// chiller Request
export const chillerRequestList = async (params: Params) => {
  try {
    const res = await API.get(`/api/assets/chiller-request/list`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const chillerRequestByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/assets/chiller-request/${uuid}`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const chillerRequestGenerateCode = async (params: Params) => {
  try {
    const res = await API.get(`/api/assets/chiller-request/generate-code`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const chillerRequestGlobalSearch = async (params: Params) => {
  try {
    const res = await API.get(`/api/assets/chiller-request/global-search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// type chillerRequestType = {
//   // Basic Outlet Information
//   owner_name: string;
//   contact_number: string;
//   landmark: string;
//   existing_coolers: string;
//   outlet_weekly_sale_volume: string;
//   display_location: string;
//   chiller_safty_grill: string;

//   // Location and Personnel
//   warehouse_id: number;
//   salesman_id: number;
//   outlet_id: number;
//   manager_sales_marketing: number;

//   // Chiller Details
//   national_id: string;
//   outlet_stamp: string | File;
//   model: string;
//   hil: string;
//   ir_reference_no: string;
//   installation_done_by: string;
//   date_lnitial: string;
//   date_lnitial2: string;
//   contract_attached: string | File;
//   machine_number: string;
//   brand: string;
//   asset_number: string;

//   // Documentation and Files
//   lc_letter: string | File;
//   trading_licence: string | File;
//   password_photo: string | File;
//   outlet_address_proof: string | File;
//   chiller_asset_care_manager: number;
//   national_id_file: string | File;
//   password_photo_file: string | File;
//   outlet_address_proof_file: string | File;
//   trading_licence_file: string | File;
//   lc_letter_file: string | File;
//   outlet_stamp_file: string | File;
//   sign__customer_file: string | File;

//   // Status and Management
//   chiller_manager_id: number;
//   is_merchandiser: number;
//   status: number;
//   fridge_status: number;
//   iro_id: number;
//   remark: string;

//   // Removed fields (if they exist in your original)
//   // outlet_name: string; // Removed - not in new form
//   // outlet_type: string; // Removed - not in new form
//   // agent_id: number;    // Removed - not in new form
//   // route_id: number;    // Removed - not in new form
// };
export const getChillerRequestById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/assets/chiller-request/${uuid}`);
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

import { APIFormData } from "./merchandiserApi";
// In your assetsApi.ts file, update the functions:

export const addChillerRequest = async (formData: FormData) => {
  try {
    const response = await APIFormData.post("/api/assets/chiller-request/add", formData);
    return response.data;
  } catch (error: unknown) {
    handleError(error);
  }
};

export const updateChillerRequest = async (
  uuid: string,
  formData: FormData
) => {
  try {
    const response = await APIFormData.post(
      `/api/assets/chiller-request/${uuid}`,
      formData
    );
    return response.data;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: unknown })?.response === "object"
    ) {
      throw (error as { response?: { data?: unknown } }).response?.data || error;
    }
    throw error;
  }
};
export const deleteChillerRequest = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/assets/chiller-request/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};



// export const getWarehouseStockDetails = async (id: string) => {
//   try {
//     const res = await API.get(`/api/settings/warehouse-stocks/${id}/stock-details`);

//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };


export const acfList = async (params: Params) => {
  try {
    const res = await API.get(`/api/assets/chiller-request/filter`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addAcf = async (body: object) => {
  try {
    const res = await API.post(`/api/assets/iro/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const iroList = async ( params: Params) => {
  try {
    const res = await API.get(`/api/assets/iro/count`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const iroViewList = async (id: string) => {
  try {
    const res = await API.get(`/api/assets/iro/${id}`);
    console.log(res, "ABCD");
    return res.data?.count?.headers;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const bulkTransferList = async ( params: Params) => {
  try {
    const res = await API.get(`/api/assets/bulk-transfer/list`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const addBulkTransfer = async (body: object) => {
  try {
    const res = await API.post(`/api/assets/bulk-transfer/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addAllocate = async (body: object) => {
  try {
    const res = await API.post(`/api/assets/bulk-transfer/allocate-assets`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};