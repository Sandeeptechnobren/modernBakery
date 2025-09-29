import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./allApi";

export const exportServiceTypes = async (params?: Params) => {
    try {
        const res = await API.get("/api/settings/service-types/export", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const serviceTypesList = async (params?: Params) => {
    try {
        const res = await API.get("/api/settings/service-types/list", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const getServiceTypesByUUID = async (uuid: string, params?: Params) => {
    try {
        const res = await API.get(`/api/settings/service-types/show/${uuid}`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const serviceTypesGenerateCode = async (params?: Params) => {
    try {
        const res = await API.get("/api/settings/service-types/generate-code", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

type serviceTypes = {
    name: string;
    status: number;
}

export const addServiceTypes = async (body: serviceTypes) => {
    try {
        const res = await API.post("/api/settings/service-types/add", body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};