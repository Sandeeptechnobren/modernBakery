"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getRouteById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBtn from "@/app/components/statusBtn2";

interface Item {
    id: string;
    sap_id: string;
    route_code: string;
    route_name: string;
    vehicle: {vehicle_code:string,number_plat:string};
    warehouse: {warehouse_code:string,warehouse_name:string};
    route_Type: {route_type_code:string,route_type_name:string};
    createdBy: {firstname:string,lastname:string};
    status: number | string;
}

const title = "Route Details";
const backBtnUrl = "/route";

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
    const [isChecked, setIsChecked] = useState(false);
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            const res = await getRouteById(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Route Details",
                    "error"
                );
                throw new Error("Unable to fetch Route Details");
            } else {
                setItem(res.data);
            }
        };
        fetchPlanogramImageDetails();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
                       <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                           {/* profile details */}
                           <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                               <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                                   <Icon
                                       icon="mdi:map"
                                       width={40}
                                       className="text-[#535862] scale-[1.5]"
                                   />
                               </div>
                               <div className="text-center sm:text-left">
                                   <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                                       {item?.route_name}
                                   </h2>
                                   <span className="flex items-center">
                                       <span className="text-[#414651] text-[16px]">
                                           <span className="font-[600]">Route Code:</span>{" "}
                                           <span className="font-[400]">
                                               {item?.route_code || "-"}
                                           </span>
                                          
                                       </span>
                                   </span>
                               </div>
                           </div>
             <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                               <StatusBtn isActive={item?.status === 1 || item?.status === '1'} />
                                           </span>
                         
                       </ContainerCard>
            <div className="flex gap-x-[20px]">
            <div className="w-full">
                
                                                {/* Location Information */}
                                                <ContainerCard className="w-auto  h-fit ">
                                                    <KeyValueData
                                                        title="Route Information"
                                                        data={[
                                                            { key: "Waregouse Code", value: item?.warehouse?.warehouse_code || "-" },
                                                            {
                                                                key: "Warehouse Name",
                                                                value: item?.warehouse?.warehouse_name || "-",
                                                            },
                                                            { key: "Vehicle Code", value: item?.vehicle?.vehicle_code || "-" },
                                                            { key: "Number Plate", value: item?.vehicle?.number_plat || "-" },
                                                            { key: "Route Type Code", value: item?.route_Type?.route_type_code || "-" },
                                                            {
                                                                key: "Route Type Name",
                                                                value: item?.route_Type?.route_type_name || "-",
                                                            },
                                                            { key: "Created By", value:  item?.createdBy?.firstname + " " + item?.createdBy?.lastname || "-" },
                                                        ]}
                                                    />
                                                </ContainerCard>
                                               
                                               
                            
                                                       
                                                    </div>
                                                    
                                            
               
            </div>
        </>
    );
}
