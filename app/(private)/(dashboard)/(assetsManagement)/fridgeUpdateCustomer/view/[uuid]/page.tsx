"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { fridgeUpdateCustomerByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ImagePreviewModal from "@/app/components/ImagePreviewModal";

type fridgeUpdate = {
    outlet_name?: string | null;
    owner_name?: string | null;
    contact_number?: string | null;
    outlet_type?: string | null;
    landmark?: string | null;
    machine_number?: string | null;
    asset_number?: string | null;
    brand?: string | null;
    status?: number;
    fridge_status?: number;
    iro_id?: number;
    remark?: string | null;
    national_id_file?: string | null;
    password_photo_file?: string | null;
    outlet_stamp_file?: string | null;
    trading_licence_file?: string | null;
    lc_letter_file?: string | null;
    outlet_address_proof_file?: string | null;
    sign__customer_file?: string | null;
    national_id1_file?: string | null;
    password_photo1_file?: string | null;
    outlet_address_proof1_file?: string | null;
    trading_licence1_file?: string | null;
    lc_letter1_file?: string | null;
    outlet_stamp1_file?: string | null;
    sign_salesman_file?: string | null;
    fridge_scan_img?: string | null;
    agent?: { name?: string };
    salesman?: { name?: string };
    warehouse?: { name?: string };
    route?: { name?: string };
};

const title = "Fridge Update Customer Details";

export default function ViewPage() {
    const params = useParams();
    const uuid: string = Array.isArray(params.uuid)
        ? params.uuid[0]
        : (params.uuid as string);

    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [fridgeUpdate, setfridgeUpdate] = useState<fridgeUpdate | null>(
        null
    );

    const base_url_img = "https://api.coreexl.com/osa_developmentV2/public";

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imagesToShow, setImagesToShow] = useState<string[]>([]);
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        const fetchChillerDetails = async () => {
            setLoading(true);
            const res = await fridgeUpdateCustomerByUUID(uuid);
            setLoading(false);

            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch fridge update customer Details",
                    "error"
                );
            } else {
                setfridgeUpdate(res.data);
            }
        };
        fetchChillerDetails();
    }, [uuid]);

    const openImageModal = (images: string[], index: number) => {
        setImagesToShow(images);
        setStartIndex(index);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setImagesToShow([]);
        setStartIndex(0);
    };

    const getFullImageUrl = (file?: string | null) => {
        if (!file) return null;
        return `${base_url_img}/${file}`;
    };


    const allImageFiles = [
        fridgeUpdate?.national_id_file,
        fridgeUpdate?.password_photo_file,
        fridgeUpdate?.outlet_stamp_file,
        fridgeUpdate?.trading_licence_file,
        fridgeUpdate?.lc_letter_file,
        fridgeUpdate?.outlet_address_proof_file,
        fridgeUpdate?.sign__customer_file,
        fridgeUpdate?.national_id1_file,
        fridgeUpdate?.password_photo1_file,
        fridgeUpdate?.outlet_address_proof1_file,
        fridgeUpdate?.trading_licence1_file,
        fridgeUpdate?.lc_letter1_file,
        fridgeUpdate?.outlet_stamp1_file,
        fridgeUpdate?.sign_salesman_file,
        fridgeUpdate?.fridge_scan_img,
    ]
        .map(getFullImageUrl)
        .filter(Boolean) as string[];


    const getFileView = (file?: string | null) => {
        if (!file) return "-";

        const fullUrl = getFullImageUrl(file);
        const index = allImageFiles.indexOf(fullUrl!);

        return (
            <button
                className="text-blue-600 underline hover:text-blue-800 transition"
                onClick={() => openImageModal(allImageFiles, index)}
            >
                View Image
            </button>
        );
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/fridgeUpdateCustomer">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>

            <div
                className="
          grid grid-cols-1 
          md:grid-cols-2 
          gap-6 
          w-full
          pb-10
        "
            >
                <ContainerCard className="h-full">
                    <KeyValueData
                        title="Documents & Attachments"
                        data={[
                            {
                                key: "National ID",
                                value: getFileView(fridgeUpdate?.national_id_file),
                            },
                            {
                                key: "Password Photo",
                                value: getFileView(fridgeUpdate?.password_photo_file),
                            },
                            {
                                key: "Outlet Stamp",
                                value: getFileView(fridgeUpdate?.outlet_stamp_file),
                            },
                            {
                                key: "Trading Licence",
                                value: getFileView(fridgeUpdate?.trading_licence_file),
                            },
                            {
                                key: "LC Letter",
                                value: getFileView(fridgeUpdate?.lc_letter_file),
                            },
                            {
                                key: "Address Proof",
                                value: getFileView(fridgeUpdate?.outlet_address_proof_file),
                            },
                            {
                                key: "Customer Signature",
                                value: getFileView(fridgeUpdate?.sign__customer_file),
                            },
                            {
                                key: "National ID 1",
                                value: getFileView(fridgeUpdate?.national_id1_file),
                            },
                            {
                                key: "Password Photo 1",
                                value: getFileView(fridgeUpdate?.password_photo1_file),
                            },
                            {
                                key: "Outlet Address Proof 1",
                                value: getFileView(fridgeUpdate?.outlet_address_proof1_file),
                            },
                            {
                                key: "Trading Licence 1",
                                value: getFileView(fridgeUpdate?.trading_licence1_file),
                            },
                            {
                                key: "LC Letter 1",
                                value: getFileView(fridgeUpdate?.lc_letter1_file),
                            },
                            {
                                key: "Outlet Stamp 1",
                                value: getFileView(fridgeUpdate?.outlet_stamp1_file),
                            },
                            {
                                key: "Salesman Signature",
                                value: getFileView(fridgeUpdate?.sign_salesman_file),
                            },
                            {
                                key: "Fridge Scan",
                                value: getFileView(fridgeUpdate?.fridge_scan_img),
                            },
                        ]}
                    />
                </ContainerCard>

                <ContainerCard className="h-full">
                    <KeyValueData
                        title="Outlet & Owner Information"
                        data={[
                            { key: "Outlet Name", value: fridgeUpdate?.outlet_name || "-" },
                            { key: "Owner Name", value: fridgeUpdate?.owner_name || "-" },
                            {
                                key: "Contact Number",
                                value: fridgeUpdate?.contact_number || "-",
                            },
                            { key: "Outlet Type", value: fridgeUpdate?.outlet_type || "-" },
                            { key: "Landmark", value: fridgeUpdate?.landmark || "-" },
                            {
                                key: "Machine Number",
                                value: fridgeUpdate?.machine_number || "-",
                            },
                            {
                                key: "Asset Number",
                                value: fridgeUpdate?.asset_number || "-",
                            },
                            { key: "Brand", value: fridgeUpdate?.brand || "-" },
                            {
                                key: "Fridge Status",
                                value: fridgeUpdate?.fridge_status ? "Active" : "Inactive",
                            },
                            { key: "Remarks", value: fridgeUpdate?.remark || "-" },
                            {
                                key: "Request Status",
                                value: "",
                                component: <StatusBtn isActive={!!fridgeUpdate?.status} />,
                            },
                        ]}
                    />
                </ContainerCard>

            </div>

            <ImagePreviewModal
                images={imagesToShow}
                isOpen={isImageModalOpen}
                onClose={closeImageModal}
                startIndex={startIndex}
            />
        </>
    );
}
