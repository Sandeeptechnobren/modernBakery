"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { getOutletChannelById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type OutletChannel = {
  outlet_channel_code: string;
  outlet_channel: string;
  status: number; // 1 or 0
};

const TITLE = "Outlet channel Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [outletChannel, setOutletChannel] = useState<OutletChannel | null>(null);

  useEffect(() => {
    const fetchOutletChannelDetails = async () => {
      setLoading(true);
      const res = await getOutletChannelById(id);
      console.log("Outlet Channel details response:", res); // Debug log
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch OutletChannel Details",
          "error"
        );
        return;
      }
      setOutletChannel(res.data);
    };
    fetchOutletChannelDetails();
  }, []);

  console.log("OutletChannel state:", outletChannel); // Debug log

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/outlet-channel">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{TITLE}</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-[20px]">
        {/* Right details card */}
        <ContainerCard className="w-full">
          <KeyValueData
            data={[
              {
                value: outletChannel?.outlet_channel_code ?? "-",
                key: "Code",
              },
              {
                value: outletChannel?.outlet_channel ?? "-",
                key: "Name",
              },
              {
                value: outletChannel?.status === 1 ? "Active" : "Inactive",
                key: "Status",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
