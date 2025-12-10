"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { chillerByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type OptionObj = {
  id: number;
  name: string;
  code?: string;
};

type Chiller = {
  osa_code: string;
  sap_code: string;
  serial_number: string;
  acquisition: string;
  assets_type: string;

  // Nested API objects
  country: OptionObj | null;
  vendor: OptionObj | null;
  assets_category: OptionObj | null;
  model_number: OptionObj | null;
  manufacturer: OptionObj | null;
  branding: OptionObj | null;

  // Other fields
  trading_partner_number: number | string;
  capacity: string;
  manufacturing_year: string;
  remarks: string;
  status: number;
};

const title = "Assets Details";

export default function ViewPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [chiller, setChiller] = useState<Chiller | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const res = await chillerByUUID(uuid);
      setLoading(false);

      if (res.error) {
        showSnackbar(res.data?.message || "Unable to fetch Assets Details", "error");
        return;
      }

      // API returns `vendor` not `vender`
      setChiller({
        ...res.data,
        vendor: res.data.vendor,
      });
    };

    fetchDetails();
  }, []);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/assetsMaster">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      <div className="flex flex-wrap lg:gap-[20px]">

        {/* ---------- Basic Information ---------- */}
        <ContainerCard className="w-full lg:w-[350px]">
          <KeyValueData
            title="Assets Basic Information"
            data={[
              { key: "OSA Code", value: chiller?.osa_code },
              { key: "SAP Code", value: chiller?.sap_code },
              { key: "Serial Number", value: chiller?.serial_number },
              { key: "Asset Category", value: chiller?.assets_category?.name },
              { key: "Model Number", value: chiller?.model_number?.name },
              { key: "Assets Type", value: chiller?.assets_type },
            ]}
          />
        </ContainerCard>

        {/* ---------- Acquisition & Vendor ---------- */}
        <ContainerCard className="w-full lg:w-[350px]">
          <KeyValueData
            title="Acquisition and Vendor Information"
            data={[
              { key: "Acquisition", value: chiller?.acquisition },
              { key: "Vendor", value: chiller?.vendor?.name },
              { key: "Manufacturer", value: chiller?.manufacturer?.name },
              { key: "Country", value: chiller?.country?.name },
            ]}
          />
        </ContainerCard>

        {/* ---------- Other Info ---------- */}
        <ContainerCard className="w-full lg:w-[350px]">
          <KeyValueData
            title="Other Information"
            data={[
              { key: "Branding", value: chiller?.branding?.name },
              { key: "Trading Partner Number", value: chiller?.trading_partner_number },
              { key: "Capacity", value: chiller?.capacity },
              { key: "Manufacturing Year", value: chiller?.manufacturing_year },
              { key: "Remarks", value: chiller?.remarks },
              {
                key: "Status",
                value: "",
                component: <StatusBtn isActive={!!chiller?.status} />,
              },
            ]}
          />
        </ContainerCard>

      </div>
    </>
  );
}
