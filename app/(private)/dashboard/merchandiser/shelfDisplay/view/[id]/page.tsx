"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import { formatDate } from "@/app/(private)/utils/date";
import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { useLoading } from "@/app/services/loadingContext";
import { shelvesListById } from "@/app/services/merchandiserApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type shelvesType = {
    shelf_name: string;
    valid_from: string;
    valid_to: string;
    height: string;
    width: string;
    depth: string;
    customer_ids: Array<string>;
};

const title = "Shelf Details";

export default function ViewPage() {
    const params = useParams();
    let id: string = "";
    if (params.id) {
        if (Array.isArray(params.id)) {
            id = params.id[0] || "";
        } else {
            id = params.id as string;
        }
    }

    // state variables
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [shelves, setShelves] = useState<shelvesType | null>(null);

    // dropdown data from context
    const { companyCustomersOptions } = useAllDropdownListData();

    useEffect(() => {
        const fetchShelfDisplay = async () => {
            setLoading(true);
            const res = await shelvesListById(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Shelf Display List",
                    "error"
                );
                throw new Error("Unable to fetch Shelf Display List");
            } else {
                setShelves(res.data);
            }
        };
        fetchShelfDisplay();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/merchandiser/shelfDisplay">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <div className="flex flex-wrap lg:gap-[20px]">
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        data={[
                            { key: "shelf_name", value: shelves?.shelf_name || "" },
                            { key: "height", value: shelves?.height || "" },
                            { key: "width", value: shelves?.width || "" },
                            { key: "depth", value: shelves?.depth || "" },
                            {
                                key: "valid_from",
                                value: formatDate(shelves?.valid_from) || "",
                            },
                            {
                                key: "valid_to",
                                value: formatDate(shelves?.valid_to) || "",
                            },
                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Assigned Customers"
                        data={
                            shelves?.customer_ids
                                ? companyCustomersOptions
                                    .filter(option => {
                                        return (Array.isArray(shelves.customer_ids)
                                            ? shelves.customer_ids
                                            : (shelves.customer_ids as string).split(",")
                                        ).includes(option.value.toString());
                                    })
                                    .map(option => ({
                                        key: option.label,
                                        value: ""
                                    }))
                                : []
                        }
                    />
                </ContainerCard>
            </div>
        </>
    );
}
