"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import StatusBtn from "@/app/components/statusBtn2";
import SummaryCard from "@/app/components/summaryCard";
import { getUserTypeById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Usertype = {
  code: string;
  name: string;
  status: number;
};

const TITLE = "Usertype Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [userType, setUSerType] = useState<Usertype | null>(null);

  useEffect(() => {
    const fetchUserTypeDetails = async () => {
      setLoading(true);
      const res = await getUserTypeById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch Usertype Details",
          "error"
        );
        return;
      }
      setUSerType(res.data);
    };
    fetchUserTypeDetails();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/user-types">
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
                value: userType?.code ?? "-",
                key: "Code",
              },
              {
                value: userType?.name ?? "-",
                key: "Name",
              },
              {
                value: userType?.status === 1 ? "Active" : "Inactive",
                key: "Status",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
